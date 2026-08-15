import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

export const VISITOR_COOKIE = "zltl_blog_visitor";

export interface BlogComment {
  id: number;
  author: string;
  body: string;
  createdAt: string;
}

export interface BlogEngagement {
  views: number;
  likes: number;
  liked: boolean;
  commentCount: number;
  comments: BlogComment[];
}

export class CommentRateLimitError extends Error {}

const databasePath = process.env.BLOG_DB_PATH
  ? resolve(process.env.BLOG_DB_PATH)
  : resolve(process.cwd(), "data/blog.sqlite");

mkdirSync(dirname(databasePath), { recursive: true });

const globalDatabase = globalThis as typeof globalThis & {
  __zltlBlogDatabase?: DatabaseSync;
};

const database =
  globalDatabase.__zltlBlogDatabase ?? new DatabaseSync(databasePath);

globalDatabase.__zltlBlogDatabase = database;

database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS post_stats (
    post_slug TEXT PRIMARY KEY,
    views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0)
  );

  CREATE TABLE IF NOT EXISTS post_likes (
    post_slug TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (post_slug, visitor_id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_slug TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    author TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS comments_post_slug_id
    ON comments (post_slug, id DESC);

  CREATE INDEX IF NOT EXISTS comments_visitor_created_at
    ON comments (visitor_id, created_at DESC);
`);

const statsStatement = database.prepare(`
  SELECT
    COALESCE((SELECT views FROM post_stats WHERE post_slug = ?), 0) AS views,
    (SELECT COUNT(*) FROM post_likes WHERE post_slug = ?) AS likes,
    (SELECT COUNT(*) FROM comments WHERE post_slug = ?) AS comment_count
`);

const commentsStatement = database.prepare(`
  SELECT id, author, body, created_at FROM (
    SELECT id, author, body, created_at
    FROM comments
    WHERE post_slug = ?
    ORDER BY id DESC
    LIMIT 200
  )
  ORDER BY id ASC
`);

export function getBlogEngagement(
  slug: string,
  visitorId?: string,
): BlogEngagement {
  const stats = statsStatement.get(slug, slug, slug) as {
    views: number;
    likes: number;
    comment_count: number;
  };
  const comments = commentsStatement.all(slug) as Array<{
    id: number;
    author: string;
    body: string;
    created_at: string;
  }>;

  const liked = visitorId
    ? Boolean(
        database
          .prepare(
            "SELECT 1 FROM post_likes WHERE post_slug = ? AND visitor_id = ?",
          )
          .get(slug, visitorId),
      )
    : false;

  return {
    views: Number(stats.views),
    likes: Number(stats.likes),
    liked,
    commentCount: Number(stats.comment_count),
    comments: comments.map((comment) => ({
      id: Number(comment.id),
      author: comment.author,
      body: comment.body,
      createdAt: comment.created_at,
    })),
  };
}

export function recordBlogView(slug: string): void {
  database
    .prepare(`
      INSERT INTO post_stats (post_slug, views)
      VALUES (?, 1)
      ON CONFLICT (post_slug) DO UPDATE SET views = views + 1
    `)
    .run(slug);
}

export function toggleBlogLike(slug: string, visitorId: string): boolean {
  const removed = database
    .prepare("DELETE FROM post_likes WHERE post_slug = ? AND visitor_id = ?")
    .run(slug, visitorId);

  if (removed.changes > 0) return false;

  database
    .prepare(`
      INSERT OR IGNORE INTO post_likes (post_slug, visitor_id, created_at)
      VALUES (?, ?, ?)
    `)
    .run(slug, visitorId, new Date().toISOString());

  return true;
}

export function addBlogComment(
  slug: string,
  visitorId: string,
  author: string,
  body: string,
): BlogComment {
  const mostRecent = database
    .prepare(`
      SELECT created_at
      FROM comments
      WHERE visitor_id = ?
      ORDER BY id DESC
      LIMIT 1
    `)
    .get(visitorId) as { created_at: string } | undefined;

  if (
    mostRecent &&
    Date.now() - new Date(mostRecent.created_at).getTime() < 30_000
  ) {
    throw new CommentRateLimitError(
      "Please wait a moment before posting another comment.",
    );
  }

  const createdAt = new Date().toISOString();
  const result = database
    .prepare(`
      INSERT INTO comments (post_slug, visitor_id, author, body, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(slug, visitorId, author, body, createdAt);

  return {
    id: Number(result.lastInsertRowid),
    author,
    body,
    createdAt,
  };
}

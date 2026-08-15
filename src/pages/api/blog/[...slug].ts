import type { APIRoute } from "astro";
import { getEntry } from "astro:content";
import {
  addBlogComment,
  CommentRateLimitError,
  getBlogEngagement,
  recordBlogView,
  toggleBlogLike,
  VISITOR_COOKIE,
} from "../../../lib/blog-db";

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    },
  });

async function getPublishedPost(slug: string | undefined) {
  if (!slug) return undefined;
  const post = await getEntry("blog", slug);
  if (!post || (post.data.draft && import.meta.env.PROD)) return undefined;
  return post;
}

function getOrCreateVisitorId(
  cookies: Parameters<APIRoute>[0]["cookies"],
): string {
  const existing = cookies.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const visitorId = crypto.randomUUID();
  cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365 * 2,
    path: "/",
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });
  return visitorId;
}

export const GET: APIRoute = async ({ params, cookies }) => {
  const post = await getPublishedPost(params.slug);
  if (!post) return json({ error: "Post not found." }, 404);

  return json(
    getBlogEngagement(post.id, cookies.get(VISITOR_COOKIE)?.value),
  );
};

export const POST: APIRoute = async ({ request, params, cookies }) => {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (!origin || origin !== requestUrl.origin) {
    return json({ error: "Invalid request origin." }, 403);
  }

  const post = await getPublishedPost(params.slug);
  if (!post) return json({ error: "Post not found." }, 404);

  let payload: Record<string, unknown>;
  try {
    const requestBody = await request.text();
    if (requestBody.length > 10_000) {
      return json({ error: "Request body is too large." }, 413);
    }
    payload = JSON.parse(requestBody) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  if (payload.action === "view") {
    recordBlogView(post.id);
    return json(
      getBlogEngagement(post.id, cookies.get(VISITOR_COOKIE)?.value),
    );
  }

  const visitorId = getOrCreateVisitorId(cookies);

  if (payload.action === "like") {
    toggleBlogLike(post.id, visitorId);
    return json(getBlogEngagement(post.id, visitorId));
  }

  if (payload.action === "comment") {
    const author = typeof payload.author === "string" ? payload.author.trim() : "";
    const body = typeof payload.body === "string" ? payload.body.trim() : "";
    const website =
      typeof payload.website === "string" ? payload.website.trim() : "";

    if (website) return json({ error: "Comment rejected." }, 400);
    if (!author || author.length > 60) {
      return json({ error: "Name must be between 1 and 60 characters." }, 400);
    }
    if (!body || body.length > 2_000) {
      return json(
        { error: "Comment must be between 1 and 2,000 characters." },
        400,
      );
    }

    try {
      const comment = addBlogComment(
        post.id,
        visitorId,
        author,
        body,
      );
      return json({ comment, engagement: getBlogEngagement(post.id, visitorId) }, 201);
    } catch (error) {
      if (error instanceof CommentRateLimitError) {
        return json({ error: error.message }, 429);
      }
      throw error;
    }
  }

  return json({ error: "Unknown action." }, 400);
};

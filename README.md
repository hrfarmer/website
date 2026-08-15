# zltl website

An Astro site with source-controlled MDX posts and SQLite-backed engagement.

Node.js 22.13 or newer is required for the built-in SQLite driver.

## Development

```sh
npm install
npm run dev
```

Blog posts live in `src/content/blog` as `.md` or `.mdx` files. Each post uses this frontmatter:

```yaml
---
title: post title
description: a short summary
publishedAt: 2026-08-15
draft: false
---
```

## SQLite

Views, likes, and comments are stored in `data/blog.sqlite` by default. The database file is intentionally ignored by Git. Set `BLOG_DB_PATH` to an absolute path on a persistent volume in production:

```sh
BLOG_DB_PATH=/var/lib/zltl/blog.sqlite node ./dist/server/entry.mjs
```

The deployment must use a persistent filesystem; ephemeral serverless filesystems will lose engagement data between deployments or instance restarts.

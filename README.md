# zltl website

An Astro site with source-controlled MDX posts and SQLite-backed engagement.

Node.js 22.13 or newer is required for the built-in SQLite driver.

## Development

```sh
npm install
npm run dev
```

Production uses Astro's standalone Node server:

```sh
npm run build
npm start
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
BLOG_DB_PATH=/data/blog.sqlite npm start
```

The deployment must use a persistent filesystem; ephemeral serverless filesystems will lose engagement data between deployments or instance restarts.

The Coolify application uses a persistent volume mounted at `/data`, with `BLOG_DB_PATH=/data/blog.sqlite`, `HOST=0.0.0.0`, `PORT=3000`, and `BLOG_ALLOWED_ORIGINS=https://aychar.dev,https://www.aychar.dev` configured as runtime variables.

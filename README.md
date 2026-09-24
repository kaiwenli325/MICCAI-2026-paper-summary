# MICCAI 2026 Paper Explorer

A fast, bilingual web interface for the summaries in [MICCAI-2026-paper-summary](https://github.com/kaiwenli325/MICCAI-2026-paper-summary).

## Features

- 1,165 English and Chinese paper summaries
- Full-text search across titles, problems, methods, and categories
- Filters for anatomy, modality, application, and machine-learning method
- Saved papers, deep-linkable search, dark mode, and responsive layout
- No framework or build step required for deployment

## Run locally

The site is static. You can use any local HTTP server. If Node.js is installed:

```bash
npm run serve
```

Then open `http://localhost:4173`.

## Refresh the paper data

The data script downloads both README files from the source repository and converts them into the JSON consumed by the site:

```bash
npm run build:data
```

Commit the changed files under `data/` after checking the result.

## Deploy with GitHub Pages

1. Create a new GitHub repository, for example `MICCAI2026-website`.
2. Push this folder to the repository's `main` branch.
3. Open **Settings > Pages** in GitHub.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.

The site will be available at:

```text
https://<your-github-username>.github.io/MICCAI2026-website/
```

Because all URLs are relative, the site also works on Netlify, Vercel, Cloudflare Pages, or any static host without changes.

For a step-by-step Chinese guide, see [PUBLISH_ZH.md](PUBLISH_ZH.md).

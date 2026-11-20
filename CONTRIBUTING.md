# Contributing

Thanks for helping out! Here's how it works.

## The flow

1. **Fork** this repo and create a branch (`feat/dark-mode`, `fix/mobile-card`, …).
2. Make your change and try it locally with `npm run dev` (see the README).
3. **Open a pull request** against `main`. Say what you changed and why, and add a screenshot if it's visual.
4. Vercel builds a **preview deployment** for your PR and posts the link on it. For PRs from forks the maintainer approves that build first, so it may take a moment.
5. The maintainer reviews, maybe asks for changes, and merges. Merging to `main` deploys to the live site.

Only the maintainer merges. Nobody pushes to `main` directly.

## Ground rules

- **Never commit real sign-up data**, exports or backups, not even "just for testing". Use demo mode.
- **Never commit secrets** (tokens, `.env` files). If you need a new setting, add it to `.env.example` with an empty value.
- Previews and local dev always run on **fake demo data**. Don't try to point them at production storage.
- Keep the site **out of search engines**: don't remove the `noindex` header in `vercel.json` or the `robots` meta tag, and don't add analytics or trackers.
- Keep it simple: plain HTML/CSS/JS, no build step, no framework, unless the PR is specifically about introducing one (open an issue first for that).
- Keep the page fast and working on phones; most Maxes will open it from WhatsApp.
- One topic per PR. Small PRs get merged faster.

## Ideas welcome

Open an issue if you're unsure whether something fits. Good first ideas: better mobile layout, more filters, accessibility fixes, a "nearest Max" feature.

## Be nice

We're all Max here. Be kind in reviews and issues.

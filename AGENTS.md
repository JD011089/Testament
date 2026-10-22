# AGENTS.md

## Production deployment (always)
- User preference: when the user asks to complete or fix app changes, treat those changes as intended for production unless they explicitly say otherwise; finish by committing (if needed), pushing, and deploying with Vercel CLI.
- When the user asks to **push** changes, that means: commit (if needed) → `git push` → `npx vercel --prod`. Do not stop after git push.
- Always deploy production with the Vercel CLI from the repo root: `npx vercel --prod`.
- Never treat `git push` alone as a production deploy. Push the commit, then run `npx vercel --prod` so the live deployment is confirmed and the production URL is generated and verified.
- Vercel project: `testament-bible-learning` — production URL: https://testament-bible-learning.vercel.app
- Mobile/APK and PWA release protocol lives in `GEMINI.md`.

## Before shipping
- Run `npm run lint`, `npm run build`, and `npm test`; only ship when all pass.

# AGENTS.md

## Production deployment (always)
- Always deploy production with the Vercel CLI from the repo root: `npx vercel --prod`.
- Never treat `git push` alone as a production deploy. Push the commit, then run `npx vercel --prod` so the live deployment is confirmed and the production URL is generated and verified.
- Vercel project: `testament-bible-learning` — production URL: https://testament-bible-learning.vercel.app
- Mobile/APK and PWA release protocol lives in `GEMINI.md`.

## Before shipping
- Run `npm run lint`, `npm run build`, and `npm test`; only ship when all pass.

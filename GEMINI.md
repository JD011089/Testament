# Project Guidelines & Collaboration Rules

## 1. Dynamic Learning & Iteration Alignment
- **Explicit Confirmation as Source of Truth**: During rapid, multi-turn feature iteration, intermediate code changes are exploratory until finalized. Treat explicit positive user feedback (such as "thank you", "that's it", "perfect", "good", or explicit approval of the result) as the authoritative signal that an implementation, UX flow, or architectural pattern is approved.
- **Anchor Future Work to Confirmed Patterns**: When proposing or writing new features, reference and adhere to patterns from previously confirmed, successful implementations rather than intermediate discarded drafts.

## 2. Concurrent Session & Task Safety
- **Non-Interference with Active Tasks**: If another session or background task is actively running or planning changes, never modify, overwrite, or clobber the files currently under active development without explicit coordination.
- **Isolate In-Progress Changes**: Verify git working tree status and active file scopes before applying edits to ensure concurrent work remains clean and conflict-free.

## 3. Rigorous Feature Testing & Verification Loop
- **Proactive End-to-End Verification**: Whenever new features are added or bugs are fixed, proactively test and verify them end-to-end to ensure they work as intended before concluding the task.
- **Inspect, Fix, Re-test Cycle**: If any failure, regression, or usability issue is found during testing, diagnose the root cause, fix it, re-test thoroughly, and only finish once the implementation is completely verified.

## 4. Production Deployment & Vercel CLI Requirement
- **Always Deploy Production via Vercel CLI**: From here on out, every production release, feature completion, or deployment must be pushed directly to Vercel production using the CLI (`npx vercel --prod` or `vercel --prod`) within this environment.
- **Do Not Rely Exclusively on Git Push for Production**: Never assume external Git push or remote hooks alone are sufficient for deploying production. Always verify and execute the CLI production deployment command (`npx vercel --prod`) directly so the live deployment is confirmed and the production URL is generated and verified.

## 5. Android APK Release & PWA Deployment Protocol
- **Strict Boundary Preservation**: Native wrapper modifications (reminders, Android settings, WorkManager/AlarmManager, permissions, manifest, Android resources) live exclusively under `twa/`. PWA source code (`src/`, `public/`) remains untouched unless web-app features are explicitly requested.
- **Version & Manifest Bumping Protocol**:
  - For every APK update, bump `versionCode` (integer) and `appVersionName` in `twa/twa-manifest.json` (and `package.json`).
  - Always re-calculate the lowercase SHA1 checksum of `twa/twa-manifest.json` and update `twa/manifest-checksum.txt` whenever `twa-manifest.json` is modified to prevent Bubblewrap build halts.
- **Artifact Naming Discipline**:
  - The build pipeline must produce and publish cleanly named release artifacts: `testament-<tag>.apk` and `testament-<tag>.aab` (e.g. `testament-v1.23.1.apk` and `testament-v1.23.1.aab`), never the default generic `app-release-signed.apk`.
- **GitHub Release Creation (Releases, Not Just Tags)**:
  - Every mobile release must be published as a full GitHub Release under `JD011089/Testament` with both `testament-<tag>.apk` and `testament-<tag>.aab` attached as downloadable release assets.
  - Never stop at creating a Git tag; always verify the CI workflow completes, the release is published, and direct asset download links are validated and provided to the user.
- **PWA Deployment as Normal**:
  - In tandem with or following any releases, keep the live web app updated by running `npx vercel --prod` so production stays completely up-to-date and in sync.


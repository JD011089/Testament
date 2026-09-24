# Project Guidelines & Collaboration Rules

## 1. Dynamic Learning & Iteration Alignment
- **Explicit Confirmation as Source of Truth**: During rapid, multi-turn feature iteration, intermediate code changes are exploratory until finalized. Treat explicit positive user feedback (such as "thank you", "that's it", "perfect", "good", or explicit approval of the result) as the authoritative signal that an implementation, UX flow, or architectural pattern is approved.
- **Anchor Future Work to Confirmed Patterns**: When proposing or writing new features, reference and adhere to patterns from previously confirmed, successful implementations rather than intermediate discarded drafts.

## 2. Concurrent Session & Task Safety
- **Non-Interference with Active Tasks**: If another session or background task is actively running or planning changes, never modify, overwrite, or clobber the files currently under active development without explicit coordination.
- **Isolate In-Progress Changes**: Verify git working tree status and active file scopes before applying edits to ensure concurrent work remains clean and conflict-free.

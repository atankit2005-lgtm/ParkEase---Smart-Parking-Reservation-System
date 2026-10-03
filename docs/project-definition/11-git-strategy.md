# 11 — Git Strategy

## Branches
- `main`: always the latest verified, stable state. No direct pushes of unverified work.
- One branch per stage, created from `main` when the stage starts (not in advance):
`stage/00-project-definition`, `stage/01-architecture`, `stage/02-infrastructure`, `stage/03-database`, `stage/04-backend-foundation`, `stage/05-authentication-authorization`, `stage/06-user-vehicle-management`, `stage/07-parking-management`, `stage/08-search-discovery-maps`, `stage/09-booking-engine`, `stage/10-payments`, `stage/11-reviews-notifications`, `stage/12-ai-recommendations`, `stage/13-admin-operator-dashboard`, `stage/14-security-performance-audit`, `stage/15-testing-production-readiness`, `stage/16-documentation-portfolio`, `stage/17-final-release`.
- Within a stage, short-lived topic branches (`feat/<stage>-<topic>`) are optional; they merge into the stage branch.

## Flow
`main → stage branch → work → verify (gate) → merge into main`. Recommended: pull request with gate checklist, squash or merge commit chosen once and documented; branch protection on `main` when the repository settings allow (Stage 02).

## Commit conventions
Format: `<type>(<optional scope>): <imperative summary>`. Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `security`, `perf`. Body explains why and references requirement IDs. Examples: `docs: add Stage 00 project definition`, `security(auth): reject role field on registration`.
Forbidden messages: `update`, `changes`, `final`, `final2`, `new`, `test`, `stuff`.
Commits are coherent and reasonably small; no secrets, build output, or unrelated formatting churn.

## Tags
Tag verified stage merges on `main` (e.g., `stage-00-complete`) only after the gate passes.

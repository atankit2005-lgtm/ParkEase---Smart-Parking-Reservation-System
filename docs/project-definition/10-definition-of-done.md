# 10 — Definition of Done & Stage Gates

## Feature Definition of Done
A feature is done only when ALL hold:
1. Requirement understood and referenced by ID.
2. Implementation complete and consistent with the documented architecture.
3. Server-side validation implemented; authorization and ownership enforced.
4. Tests written: happy path, negative, abuse, and edge cases; all pass locally and in CI.
5. Security reviewed (checklist below); sensitive-area changes human-reviewed.
6. Edge cases considered (time zones, concurrency, retries, empty/large data).
7. Documentation updated (docs, API contract, ADR if a decision was made).
8. Code reviewed by someone other than the author (human, and AI as supplementary).
9. No known critical or high issues open; remaining issues documented with owner decision.
10. Verification completed (build, lint, tests, manual check where relevant).

"Works on my machine" is not done.

## Security review checklist (per change)
- Is every route's auth/role declared and tested? Is ownership checked on every resource access?
- Is input schema-validated, with unknown fields rejected/stripped?
- Are client-supplied price, status, owner, role, or payment state ignored?
- Are queries injection-safe? Is output encoded/shaped?
- Are secrets, tokens, PII kept out of logs and responses?
- Are multi-step operations atomic/idempotent? Are failure paths consistent?

## Stage gate
A stage passes only when: requirements satisfied; implementation complete; tests exist and pass; security reviewed; architecture consistent; documentation complete; known issues resolved or documented; independent review done; designated branch contains the work; the stage checklist passes. On failure: Fix → Test → Audit → Verify, repeat. Only then merge to `main`.

## Stage 00 gate checklist
Status reflects an honest evaluation of content by the authoring agent. "Pending" items require independent/human action. Nothing here is a self-certified pass.

| Item | Status | Basis |
|---|---|---|
| Product vision finalized | Drafted — pending owner approval | 01 |
| Problem statement finalized | Drafted — pending owner approval | 01 |
| Target users defined | Done | 01, 03 |
| Goals defined | Done | 01 |
| Success criteria defined | Done | 01 (SC-1..6) |
| Functional requirements defined | Done (decision points open, including DP-17) | 02, 07 |
| Non-functional requirements defined | Done (numeric targets open, DP-12) | 06 |
| Roles defined | Done | 03 |
| Permissions defined | Done (DP-03, DP-09, DP-11 open) | 03 |
| Feature scope defined | Done (DP-06 open) | 04 |
| Core workflows defined | Done | 05 |
| Security principles defined | Done | 02 SEC-*, 09 |
| MERN requirement documented | Done | 07 |
| MongoDB requirement documented | Done | 07 |
| System constraints documented | Done | 07 |
| AI-agent governance defined | Done | 08, AGENTS.md |
| Engineering standards defined | Done | 09 |
| Testing philosophy defined | Done | 12 |
| Definition of Done defined | Done | this file |
| Git strategy defined | Done | 11 |
| Documentation strategy defined | Done | 13 |
| Roadmap defined | Done | 14 |
| Internal consistency audit completed | Independent review completed; targeted corrections applied for DP-17 and related payment/workflow consistency | 02, 05, 07 |
| Requirements reviewed | Independent review completed; targeted correction applied for zero-cost/payment-exempt bookings | 02, 07 |
| Security review completed | Independent documentation-level security consistency review completed; implementation security review remains stage-specific | 02, 08, 09 |
| Documentation reviewed | Independent review completed; targeted consistency corrections applied | 01–14, AGENTS.md, CONTRIBUTING.md |
| Stage branch verified | See final report (git status) | — |
| Stage 00 documentation complete | Authored; completeness contingent on review | — |
| Stage 00 ready for independent review | Yes, with open decision points listed in 07 | — |

Stage 00 is **not passed** until the independent review is done and the owner resolves or explicitly defers each DP item needed for Stage 01.

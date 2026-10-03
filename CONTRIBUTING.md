# Contributing to ParkEase

Governing rules are in `docs/project-definition/` and `AGENTS.md`. This file covers workflow and does not redefine them.

## Workflow
Plan → Implement → Test → Audit → Fix → Verify → Document → Commit → Push stage branch → Stage gate → Next stage. Work happens on the current stage branch (`stage/NN-name`), created from `main`; `main` receives only gate-verified work (see `docs/project-definition/11-git-strategy.md`).

## Commits
`<type>(<scope>): <imperative summary>` with types `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `security`, `perf`. Explain why in the body and reference requirement IDs. Avoid vague messages (`update`, `final`, `stuff`).

## Pull requests
Include: purpose and stage, requirement IDs, summary of changes, tests added/run and results, security considerations, documentation updates, open questions, and the relevant gate checklist. Keep PRs focused.

## Testing
Follow `12-testing-strategy.md`. Meaningful changes need tests, including negative and abuse cases for anything touching auth, ownership, bookings, payments, or concurrency. All tests pass before review.

## Documentation
Update docs and ADRs in the same PR as the change (`13-documentation-strategy.md`).

## Review
Every change is reviewed by someone other than its author against the Definition of Done (`10-definition-of-done.md`). Reviewers check requirements, authorization, validation, tests, docs, and scope.

## AI-assisted development
AI agents follow `AGENTS.md` and `08-ai-agent-governance.md`. AI-generated changes get the same review as human changes, and the human submitter is responsible for them. AI agents do not approve their own work. Do not paste secrets or real personal data into AI tools.

## Security-sensitive changes
Authentication, authorization, payments, transactions, secrets, personal data, and privileged operations require: `security` label/commit type, explicit negative tests, a reviewer assigned for security, and documentation of the decision. Report vulnerabilities privately to the project owner rather than in public issues.

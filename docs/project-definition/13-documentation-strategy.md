# 13 — Documentation Strategy

- **Source of truth**: `docs/project-definition/` for scope and rules; `AGENTS.md` for agent operating rules; `CONTRIBUTING.md` for workflow. Rules live in one place; other files link rather than restate.
- **Future documentation** (created by the stage that makes the decision): `docs/architecture/` (system design, ADRs), `docs/api/` (contracts), `docs/database/` (collections, indexes, invariants), `docs/security/` (threat model, decisions), `docs/deployment/`, `docs/testing/`, `docs/ai/`.
- **ADRs**: any significant architecture, security, database, payment, deployment, or AI decision is recorded as a numbered ADR (context, decision, alternatives, consequences, status).
- **Freshness rule**: a change that alters behavior, API, schema, config, or architecture updates the affected docs in the same PR; reviewers check this (Definition of Done item 7). Each stage gate includes a docs consistency check against the code.
- **README**: describes only what currently exists and works; no aspirational claims. The existing README is a placeholder to be rewritten in a later stage; Stage 00 does not edit it unless required.
- **Change log of requirements**: changes to requirement IDs are recorded with date and approver; IDs are not reused.

# ADR-001 — Monorepo and TypeScript

- **Status:** Accepted — OD-03 (TypeScript scope) owner approved 2026-10-03; monorepo/layout is the DP-01 Stage 01 decision recorded here
- **Date:** 2026-10-03
- **Decision points:** DP-01 (monorepo vs separate packages, folder layout) — decided here per Stage 00 delegation; OD-03 (TypeScript scope) — owner approved Option A (2026-10-03)

## Context
MERN is mandatory. TypeScript is preferred/expected, and the Stage 00 constraints delegated the final adoption scope to Stage 01; this ADR resolves that scope (OD-03, owner approved below). The frontend and backend share transport contracts and benefit from synchronized type/schema changes.

## Decision
This ADR records the DP-01 Stage 01 decision — a single repository with:

- `apps/api`: Node.js + Express + TypeScript.
- `apps/web`: React + TypeScript.
- `packages/contracts`: shared transport-facing schemas/types, without server-only dependencies.
- `packages/config`: only genuinely shared configuration utilities.

Use a workspace-capable package manager selected in Stage 02. Keep deployment boundaries independent even though source is monorepo-based.

TypeScript strict mode is **required** for all production application and package code (see OD-03 below). JavaScript is not used for production modules.

## TypeScript scope — OD-03: RESOLVED / OWNER APPROVED (Option A)

The owner approved **Option A** on 2026-10-03. The following is a binding architectural decision.

- **Production application code must be TypeScript** — `apps/api` (Node.js + Express) and `apps/web` (React).
- **Production package code must be TypeScript** — `packages/*` (e.g., `contracts`, `config`).
- **TypeScript strict mode applies** to all production application and package code.
- **JavaScript must not be used as production application/package source.** Changing this requires a future explicit owner decision.
- **Tooling/configuration files may use whatever format their respective tools require** (e.g., `.js`/`.cjs`/`.mjs`/`.json` config loaders, build scripts, workspace tooling). This decision governs production application/package code only — it does not constrain tooling/config file format.

Because the scope is now fixed, Stage 02 tooling (compiler, linter, formatter, CI) must enforce TypeScript strict mode for all production application/package code and must not provide a path to ship production JavaScript modules.

### TypeScript alternative rejected (Option B)
Option B (JavaScript permitted for production modules alongside TypeScript) was considered and rejected by the owner: it introduces mixed-typing seams and `any` leakage across boundaries, weakening exactly the security-critical code paths. The authoring agent's recommendation (Option A) matches the owner decision.

## Consequences
Positive:
- One versioned source for frontend/backend contracts.
- Easier atomic changes across applications.
- Consistent tooling.

Trade-offs:
- Workspace/tooling complexity.
- Shared packages must avoid leaking server-only code into the browser.

## Alternatives considered (repository structure)
Separate client/server repositories would reduce workspace complexity but duplicate cross-boundary contract coordination.

## Implementation boundary
Toolchain, workspace manager, linting, formatting, test runners, and CI are Stage 02.

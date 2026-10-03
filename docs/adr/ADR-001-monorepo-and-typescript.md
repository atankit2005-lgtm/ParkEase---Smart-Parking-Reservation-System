# ADR-001 — Monorepo and TypeScript

- **Status:** Proposed — owner review required
- **Date:** 2026-10-03

## Context
MERN is mandatory. TypeScript is preferred/expected, and Stage 01 must determine its adoption scope. The frontend and backend share transport contracts and benefit from synchronized type/schema changes.

## Decision
Propose a single repository with:

- `apps/api`: Node.js + Express + TypeScript.
- `apps/web`: React + TypeScript.
- `packages/contracts`: shared transport-facing schemas/types, without server-only dependencies.
- `packages/config`: only genuinely shared configuration utilities.

Use a workspace-capable package manager selected in Stage 02. Keep deployment boundaries independent even though source is monorepo-based.

TypeScript strict mode is proposed for new application code. JavaScript is not planned for new production modules.

## TypeScript scope — OD-03: OWNER DECISION REQUIRED

`07-technical-constraints.md` (constraint 3) makes TypeScript "preferred/expected" and assigns the final adoption scope to Stage 01. Because this is a ground-up rebuild, the scope must be stated unambiguously, and the project owner must approve it before this ADR can move from Proposed to Accepted.

| Option | Rule | Notes |
|---|---|---|
| **A** | **TypeScript-only** for all production application and package code (`apps/api`, `apps/web`, `packages/*`), strict mode; JavaScript permitted only in tooling/config files that cannot be TypeScript (e.g., certain build config loaders), each justified | Single language discipline; contracts, DTOs, and domain rules all statically typed; strict mode catches whole defect classes before runtime |
| **B** | JavaScript permitted for production modules alongside TypeScript | Lower barrier for occasional scripts; in practice produces mixed-typing seams, `any` leakage across boundaries, and weaker guarantees in exactly the security-critical code paths |

**Agent recommendation (not a decision): Option A — TypeScript-only, strict mode, for production application/package code.** Since nothing legacy constrains this rebuild, Option B's flexibility has little value here and dilutes the typing of shared contracts.

Until OD-03 is resolved, the "TypeScript strict mode" wording above remains a **proposal**, and Stage 02 tooling setup is blocked from finalizing lint/compile rules that assume either option.

## Consequences
Positive:
- One versioned source for frontend/backend contracts.
- Easier atomic changes across applications.
- Consistent tooling.

Trade-offs:
- Workspace/tooling complexity.
- Shared packages must avoid leaking server-only code into the browser.

## Alternatives considered
Separate client/server repositories would reduce workspace complexity but duplicate cross-boundary contract coordination.

## Implementation boundary
Toolchain, workspace manager, linting, formatting, test runners, and CI are Stage 02.

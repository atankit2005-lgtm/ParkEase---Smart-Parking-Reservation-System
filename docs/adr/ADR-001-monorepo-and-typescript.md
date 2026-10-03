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

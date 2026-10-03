# ADR-008 — Stage 01 Technology Decisions

- Status: Proposed — owner review required
- Date: 2026-10-03

## Decisions proposed

| Area | Proposal | Rationale |
|---|---|---|
| Runtime | Node.js LTS + TypeScript | Required MERN stack with maintainable typed backend |
| HTTP | Express.js | Required MERN component |
| Frontend | React + Vite + TypeScript | Required React frontend with fast development/build workflow |
| Database | MongoDB | Mandatory |
| ODM | Mongoose | Schema, validation, indexes, and MongoDB transaction support |
| Styling | Tailwind CSS | Expected technology direction |
| API contracts | Zod or equivalent boundary schema library | Runtime validation and inferred types where appropriate |
| Testing | Vitest + Supertest; browser E2E tool selected in Stage 02 | Unit/API testing without coupling domain code to HTTP |
| Formatting/lint | ESLint + Prettier | Consistent reviewable source |
| CI | GitHub Actions | Expected direction; final workflows Stage 02 |
| Local DB | Docker MongoDB replica set for transaction/concurrency tests | Reproducible transaction-capable development/testing |
| Payment | Razorpay | Owner decision DP-07 |
| Maps | Provider selected in Stage 08 | No need to lock provider before discovery requirements |
| Email | Provider selected in Stage 11 | DP-08 deferred |

## Dependency rule
Only dependencies that serve a documented requirement or architectural concern should be added. Stage 02 will validate exact versions, package-manager choice, lockfile, and CI support.

## Scope boundary
This ADR is a proposal, not authorization to install or configure the listed tools during Stage 01.

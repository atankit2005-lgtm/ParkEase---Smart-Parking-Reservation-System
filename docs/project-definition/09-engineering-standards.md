# 09 — Engineering Standards

## Priorities
Correctness, security, maintainability, readability, modularity, testability, observability, performance, accessibility, reliability. Scalability only where justified.

## General
- Business rules live in services (domain logic), not in route handlers or React components.
- One source of truth for authorization policy; no duplicated per-route role logic.
- Validate all external input at the boundary with a schema; output shaping via explicit DTOs/serializers (never return raw documents with sensitive fields).
- No magic values (use constants/config); no hardcoded secrets or environment-specific URLs; configuration validated at startup.
- Avoid: unnecessary abstraction, premature optimization, duplicated logic, giant files/components, uncontrolled global state, hidden side effects, undocumented decisions.
- Suggested size guidance (review triggers, not hard rules): functions >50 lines, files >300 lines, React components >200 lines warrant justification.
- Errors: typed/centralized handling; generic client messages; detailed server-side logs without secrets.
- Logging: structured; correlation ID; never log passwords, secrets, raw tokens, payment data.

## Backend
Layering (adopt only what adds clarity): routes → controllers → services → data access/models; plus validation, middleware, authorization, config, utilities. Dependency direction flows inward; services do not depend on `req`/`res`.

## Database (MongoDB)
- Schema validation plus Mongoose schemas; explicit indexes with documented query rationale; unique/compound indexes enforce invariants.
- Atomic operations/transactions for multi-document invariants (booking, cancellation, payment confirmation). Transaction needs (replica set) recorded in DP-15.
- Migrations/seed scripts are versioned and reviewable; schema changes documented in an ADR.
- Store timestamps in UTC; keep time-zone info explicit (DP-14).

## Frontend (React)
Reusable components; feature-oriented organization; clear state management (server state separate from UI state); accessible semantics; responsive; loading/error/empty states; forms with validation that mirrors but never replaces server validation; no business-critical computation trusted from the client; auth token handling per DP-02.

## Dependencies
Justify each; pin via lockfile; run audit in CI; remove unused.

## Tooling (to be set up in Stage 02)
TypeScript strictness, linter, formatter, test runners, pre-commit checks, CI. Not configured in Stage 00.

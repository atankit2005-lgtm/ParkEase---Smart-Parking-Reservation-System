# 01 — System Architecture

## Status
Proposed for Stage 01 owner review.

## Scope
This document defines the logical architecture for ParkEase 2.0. It does not authorize Stage 02 infrastructure implementation.

## Architectural goals
- Keep booking, payment, authorization, and availability server-authoritative.
- Keep business rules independent from HTTP and React.
- Make ownership and operator facility scope enforceable in one policy layer.
- Make booking/payment operations atomic or explicitly idempotent.
- Keep public discovery separate from authenticated personal data.
- Preserve future support for maps, notifications, and advisory recommendations without coupling them to transaction authority.

## Proposed repository shape

```text
ParkEase/
├── apps/
│   ├── api/                 # Express + Node + TypeScript
│   └── web/                 # React + TypeScript
├── packages/
│   ├── contracts/           # Shared transport schemas/types only
│   └── config/              # Shared non-secret configuration helpers
├── docs/
├── scripts/
└── package.json
```

A monorepo is proposed for shared contracts and synchronized frontend/backend changes. Final package tooling belongs to Stage 02.

## Backend logical layers

```text
HTTP routes
  ↓
Controllers
  ↓
Validation / request DTOs
  ↓
Authorization policy
  ↓
Application services
  ↓
Domain rules
  ↓
Repositories / data access
  ↓
MongoDB
```

Cross-cutting middleware handles request IDs, session extraction, rate limits, and centralized errors. Services never depend directly on Express request/response objects.

## Frontend boundaries

```text
Pages / route guards
  ↓
Feature components
  ↓
Application hooks
  ↓
Server-state client
  ↓
Typed API client
  ↓
HTTP API
```

Frontend validation improves UX only. It never establishes authorization, price, availability, payment success, or booking state.

## Domain boundaries

- Identity: users, sessions, password reset, role assignment.
- Parking: facilities, zones, physical slots, operating hours, pricing rules.
- Booking: booking lifecycle, slot reservation, holds, cancellation.
- Payment: payment intent/state, provider references, verification, refunds.
- Reviews: eligibility, review lifecycle, rating aggregation.
- Notifications: event-driven user notifications.
- Audit: append-only privileged-action records.
- Recommendation: advisory ranking only.

## Authority boundaries

| Concern | Authoritative source |
|---|---|
| Identity | Server session + database |
| Role | Server-side user record |
| Ownership/scope | Authenticated identity + stored relationships |
| Availability | Slot + booking + operating-hour state |
| Price/tax | Server pricing rules |
| Payment success | Verified Razorpay server event/response |
| Booking state | Booking service/database |
| Refund state | Payment service/provider reconciliation |
| AI recommendation | Advisory only |

## Request flow

A protected request is processed as:

1. Parse request and correlation ID.
2. Resolve the server-managed session.
3. Validate request schema and reject/strip unexpected fields according to endpoint policy.
4. Apply shared authorization policy.
5. Execute application service.
6. Persist through repository/data-access rules.
7. Shape an explicit response DTO.
8. Emit required audit/notification events.
9. Return a generic client-safe response.

## Consistency strategy

Single-document state changes use atomic MongoDB operations with predicates where possible. Multi-document invariants use MongoDB transactions where required. Booking, cancellation, payment confirmation, and refund bookkeeping must have explicit idempotency behavior.

The concrete strategies are normative in:

- **ADR-003** — booking concurrency: slot-document serialization gate, transaction-scoped overlap check, conditional lifecycle transitions.
- **ADR-011** — booking/payment cross-system state consistency: invariants, idempotent verification, reconciliation.
- **03-api-conventions.md §Idempotency** — client retry safety for consequential mutations.

## External integrations

Payment, maps, email, and future AI providers are accessed behind application-level interfaces. Provider failures cannot directly mutate authoritative booking state without server validation.

## Deployment boundary

Deployment topology, MongoDB Atlas tier, CI, Docker, and environment implementation are Stage 02 concerns. This architecture only requires configuration to be validated at startup and secrets to remain outside source control.

## Explicit non-goals for Stage 01

No application scaffold, database schema implementation, CI setup, Docker setup, payment integration, frontend implementation, or production deployment is part of this stage.

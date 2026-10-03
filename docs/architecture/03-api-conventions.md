# 03 — API Conventions

## Status
Proposed for Stage 01 owner review.

## Base
The API is versioned under `/api/v1`. Resource naming is plural and HTTP semantics are conventional.

Examples:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/facilities`
- `GET /api/v1/facilities/:facilityId`
- `POST /api/v1/bookings`
- `GET /api/v1/bookings/me`
- `POST /api/v1/bookings/:bookingId/cancel`

Exact route inventory is finalized alongside implementation in later stages.

## Authentication

Authentication uses the server-managed session model from DP-02 (ADR-002, lifecycle/CSRF detail in ADR-010). Browsers receive an httpOnly secure cookie. The API never accepts a client-provided user ID as an authority claim.

Personal-resource endpoints prefer **authenticated context** over client-chosen identifiers: `GET /api/v1/bookings/me` resolves the principal from the session, rather than `GET /api/v1/bookings?userId=...` letting clients name an arbitrary user. Where an administrator or operator legitimately accesses another principal's resources, the identity comes from the path resource plus the authorization policy — never from a mutable query/body claim.

## Authorization declaration

Every protected route declares a policy consisting of:

- authentication requirement;
- permitted principal(s) (role **and** operator approval status where relevant);
- ownership/scope rule (including facility scope for operators);
- sensitive-data visibility rule;
- audit requirement where applicable.

Deny-by-default applies when a route has no explicit policy. The normative framework and representative matrix are defined in `05-authorization-matrix.md` (ADR-007).

## Request handling

1. Parse and validate transport input.
2. Reject or strip unknown fields according to schema policy.
3. Authenticate.
4. Authorize.
5. Call application service.
6. Return an explicit response DTO.

Controllers must not contain booking, pricing, payment, or authorization business rules.

## Resource identifiers

Opaque database identifiers may be exposed only where needed by the public API. User identity is never accepted from request body fields for ownership-sensitive operations.

## Errors

Responses use a stable envelope:

```json
{
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "The requested slot is no longer available.",
    "requestId": "..."
  }
}
```

Client messages remain generic enough to avoid leaking resource existence or internal implementation details.

## Pagination

Collection endpoints use explicit pagination parameters and bounded page sizes. Server-defined defaults and maximums prevent unbounded queries.

## Filtering and sorting

Only allow-listed filter and sort fields are accepted. Arbitrary MongoDB operators or query fragments are never accepted from clients.

## Idempotency

Retry-sensitive mutations are idempotent at the architecture level. This is a defined mechanism, not an optional per-endpoint convenience; exact header names, storage schema, and retention values are finalized in Stage 09/10 implementation.

### Mechanism

- The client supplies an **idempotency key**: a client-generated, high-entropy, single-operation identifier sent with the request.
- The server binds the key to the **authenticated principal** and the target operation, and stores: key, principal, operation, a **request fingerprint** (hash of the validated, canonicalized request payload), execution state (`IN_PROGRESS` / `COMPLETED`), and the **stored result** (response status + response DTO) once completed.
- **Replay behavior:** same key + same principal + same fingerprint → the stored result is returned without re-executing the operation. A replay must be indistinguishable from the original success to the client, and must not create duplicate side effects.
- **Concurrent in-flight replay:** same key while the first execution is still `IN_PROGRESS` → rejected with a retryable conflict; the operation is never executed twice in parallel under one key.
- **Conflicting reuse:** same key + **different** fingerprint → rejected as misuse (the key already identified a different request); the server never silently executes the new payload.
- Keys are scoped per principal: one user's key can never retrieve or interfere with another user's stored result.
- **Expiration/retention:** stored idempotency records are retained for a bounded window (at minimum covering realistic client retry windows); after expiry a reused key is treated as a fresh request. Exact duration: Stage 09/10.

### Applicable operations

| Operation | Idempotency approach |
|---|---|
| Booking creation | Client idempotency key. Complements (does not replace) the ADR-003 serialization gate: the gate resolves concurrent races between *different* requests; the key makes *retries of the same* request safe. |
| Payment creation/initiation | Client idempotency key; one booking never accrues two payable provider orders (ADR-011). |
| Webhook processing | Provider **event identity** is the natural idempotency key; duplicates and out-of-order deliveries are absorbed (ADR-005, ADR-011). |
| Cancellation | Conditional state transition is inherently idempotent (re-cancelling a cancelled booking is a no-op/409, never a second refund trigger). |
| Refund operations | Idempotency key + conditional transitions; a refund is never executed twice for one triggering event (ADR-011). |

This is deliberately not a generalized idempotency framework for every endpoint — only operations where retries or duplicate deliveries are realistic and side effects are consequential.

## Public versus private data

Public discovery may expose facility information, availability, and exact pricing per DP-05. Personal information, vehicles, private bookings, and payment history remain protected.

## Response shaping

Never return raw Mongoose documents. DTOs/serializers explicitly select fields and remove credentials, session material, secrets, internal provider data, and unnecessary PII.

## Time representation

API timestamps are ISO 8601 values representing UTC instants unless an endpoint explicitly accepts a facility-local date/time as a business input. Facility timezone is identified by IANA timezone name.

## API documentation

The final OpenAPI/API reference is produced as implementation stabilizes. Stage 01 establishes conventions, not a complete generated specification.

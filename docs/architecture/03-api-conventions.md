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

Authentication uses the server-managed session model from DP-02. Browsers receive an httpOnly secure cookie. The API never accepts a client-provided user ID as an authority claim.

## Authorization declaration

Every protected route declares a policy consisting of:

- authentication requirement;
- permitted role(s);
- ownership/scope rule;
- sensitive-data visibility rule;
- audit requirement where applicable.

Deny-by-default applies when a route has no explicit policy.

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

Payment and other retry-sensitive mutation endpoints support an idempotency mechanism where the operation can safely be retried. The exact header/storage implementation is finalized with Stage 09/10 implementation.

## Public versus private data

Public discovery may expose facility information, availability, and exact pricing per DP-05. Personal information, vehicles, private bookings, and payment history remain protected.

## Response shaping

Never return raw Mongoose documents. DTOs/serializers explicitly select fields and remove credentials, session material, secrets, internal provider data, and unnecessary PII.

## Time representation

API timestamps are ISO 8601 values representing UTC instants unless an endpoint explicitly accepts a facility-local date/time as a business input. Facility timezone is identified by IANA timezone name.

## API documentation

The final OpenAPI/API reference is produced as implementation stabilizes. Stage 01 establishes conventions, not a complete generated specification.

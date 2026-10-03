# 02 — Domain Model

## Status
Proposed for Stage 01 owner review.

## Core aggregates and entities

### User
Identity and profile owner. Fields include identity credentials, role, profile data, preferences, and lifecycle metadata. Password hashes are never exposed through DTOs.

### Session
Server-managed authenticated session. Contains an opaque session identifier/token reference, user association, expiration, rotation/revocation metadata, and security timestamps.

### Vehicle
A vehicle owned by exactly one user. Bookings reference a vehicle owned by the authenticated booker.

### Facility
A parking facility owned by an operator. Stores location, IANA timezone, operating-hour policy, and facility metadata.

### Zone
A subdivision of a facility. A zone belongs to exactly one facility.

### ParkingSlot
A physical reservable slot. A slot belongs to exactly one zone and therefore exactly one facility. Slot identity is stable; availability is derived from slot state plus bookings/holds.

### PricingRule
A server-side rule associated with a facility or applicable scope. It defines how authoritative price is calculated for a requested booking window.

### Booking
A reservation owned by one user for one facility/slot, with one vehicle, requested time window, authoritative price snapshot, lifecycle state, and audit timestamps.

### Payment
A server-side payment record bound to exactly one booking. Stores amount, currency, provider identifiers where applicable, verification state, and reconciliation metadata. It never stores raw card data.

### Refund
A server-side record of refund evaluation/request/result for a payment. Provider reconciliation is represented explicitly.

### Review
A review authored by a user for an eligible completed booking/facility. Eligibility is tied to the booking rather than a client-supplied claim.

### Notification
A user-facing record of a domain event. Content is generated server-side and excludes sensitive information.

### AuditLog
Append-only record for privileged actions, containing actor, action, target, timestamp, outcome, and sufficient context for investigation without secrets or sensitive payment data.

## Relationships

```text
User 1 ── * Vehicle
User 1 ── * Booking
User 1 ── * Session

Operator(User role) 1 ── * Facility
Facility 1 ── * Zone
Zone 1 ── * ParkingSlot

Facility 1 ── * PricingRule
Facility 1 ── * Booking
ParkingSlot 1 ── * Booking

Booking 1 ── 0..1 Payment
Payment 1 ── * Refund

Booking 1 ── 0..1 Review
User 1 ── * Notification
User 1 ── * AuditLog (as actor)
```

## Key invariants

1. A booking owner comes only from the authenticated session.
2. A booking vehicle must belong to the booking owner.
3. A slot must belong to the requested facility/zone.
4. A booking time window must satisfy the facility-local operating policy.
5. Active overlapping bookings for the same physical slot are forbidden.
6. Booking price is calculated server-side and persisted as an authoritative snapshot.
7. A confirmed paid booking requires verified payment state; ₹0 bookings use payment status `NOT_REQUIRED`.
8. Operators can access only facilities they own.
9. Audit records are append-only through the application.
10. Historical booking/payment amounts are not recalculated from later pricing-rule changes.

## Booking lifecycle

Proposed states:

```text
PENDING_PAYMENT ──→ CONFIRMED
      │                 │
      │                 ├──→ CANCELLED
      │                 └──→ COMPLETED
      └──────────────→ EXPIRED
```

Cancellation/refund policy parameters remain configurable and require the owner-approved Stage 09 ADR before implementation.

## Payment lifecycle

Proposed states:

```text
NOT_REQUIRED

or

CREATED → PENDING → VERIFIED
                  ├──→ FAILED
                  └──→ EXPIRED
```

Refund state is tracked separately so a cancellation does not falsely imply that a provider refund has already completed.

## Stage boundary

Exact MongoDB schema syntax, indexes, validators, transaction implementation, and migrations belong to Stage 03.

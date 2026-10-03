# 02 — Domain Model

## Status
Proposed for Stage 01 owner review.

## Core aggregates and entities

### User
Identity and profile owner. Fields include identity credentials, role, profile data, preferences, and lifecycle metadata. Password hashes are never exposed through DTOs.

### OperatorProfile
Operator lifecycle record associated with a User holding the `OPERATOR` role. It separates **role** from **approval/lifecycle status**:

```text
REQUESTED ──→ APPROVED ──→ SUSPENDED ──→ APPROVED (reinstatement)
     │             │
     └──→ REJECTED └──→ (suspension is reversible only by ADMIN action)
```

Status transitions are performed only by an ADMIN (DP-03), are audited, and are never client-writable. Holding the `OPERATOR` role does **not** by itself mean the account is an approved active operator: creating facilities and exercising operator-scoped access requires status `APPROVED`. The effect of `SUSPENDED`/`REJECTED` on already-published facilities is an administration policy finalized with the Stage 07/13 implementation; confirmed bookings remain protected under DP-09 in all cases.

### Session
Server-managed authenticated session. Contains an opaque session identifier/token reference, user association, expiration, rotation/revocation metadata, and security timestamps.

### Vehicle
A vehicle owned by exactly one user. Bookings reference a vehicle owned by the authenticated booker.

### Facility
A parking facility owned by exactly one operator (`Facility.ownerUserId`). Stores location, IANA timezone, operating-hour policy, and facility metadata. The owner must be a User with the `OPERATOR` role whose OperatorProfile status is `APPROVED`.

### Zone
A subdivision of a facility. A zone belongs to exactly one facility (`Zone.facilityId`).

### ParkingSlot
A physical reservable slot. A slot belongs to exactly one zone (`ParkingSlot.zoneId`) and therefore exactly one facility. Slot identity is stable; availability is derived from slot state plus bookings/holds. The slot document also carries the monotonic `reservationVersion` field used as the booking serialization gate (ADR-003).

### PricingRule
A server-side rule associated with a facility or applicable scope. It defines how authoritative price is calculated for a requested booking window.

### Booking
A reservation owned by one user for one facility/slot, with one vehicle, requested time window, authoritative price snapshot, lifecycle state, hold expiration (`holdExpiresAt`, ADR-006), and audit timestamps. A booking stores `userId`, `vehicleId`, `facilityId`, and `slotId`; all four are server-validated as described in the ownership and reference-integrity rules below.

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

### Ownership chain

All ownership references are stored server-side and resolved from persisted documents. Clients can never define or redefine an ownership reference.

```text
User (role OPERATOR, OperatorProfile APPROVED)
 └── Facility.ownerUserId
      Facility
       └── Zone.facilityId
            Zone
             └── ParkingSlot.zoneId
```

A slot's facility is always derived through its zone (`ParkingSlot.zoneId → Zone.facilityId`); a slot can never be attached to a facility other than the one owning its zone.

### Booking references

A booking stores four references, each server-validated at creation inside the reservation workflow (ADR-003):

```text
Booking
 ├── userId      ← taken only from the authenticated session, never from request data
 ├── vehicleId   ← must satisfy Vehicle.ownerUserId == Booking.userId
 ├── facilityId  ← must equal the facility derived from the slot's zone
 └── slotId      ← ParkingSlot.zoneId must reference a Zone whose facilityId == Booking.facilityId
```

This makes it structurally impossible for a booking to reference another user's vehicle, a slot belonging to another facility, or an inconsistent slot/zone/facility relationship.

### Entity relationships

```text
User 1 ── * Vehicle
User 1 ── * Booking
User 1 ── * Session
User(OPERATOR) 1 ── 0..1 OperatorProfile

Operator(User) 1 ── * Facility
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

`Facility → PricingRule`, `Facility → Booking`, and `ParkingSlot → Booking` are stored domain relationships resolved server-side from persisted references — not arbitrary collections with client-defined references.

## Key invariants

1. A booking owner comes only from the authenticated session.
2. A booking vehicle must belong to the booking owner (`Vehicle.ownerUserId == Booking.userId`).
3. A booking's slot must belong to a zone of the booking's facility (`ParkingSlot.zoneId → Zone.facilityId == Booking.facilityId`).
4. A booking time window must satisfy the facility-local operating policy.
5. Active overlapping bookings for the same physical slot are forbidden (serialization strategy: ADR-003).
6. Booking price is calculated server-side and persisted as an authoritative snapshot.
7. A confirmed paid booking requires verified payment state; ₹0 bookings use payment status `NOT_REQUIRED`.
8. Operators can access only facilities they own.
9. Audit records are append-only through the application.
10. Historical booking/payment amounts are not recalculated from later pricing-rule changes.
11. A facility's owner must be a User with the `OPERATOR` role and OperatorProfile status `APPROVED` at ownership-establishment time; operator status transitions are ADMIN-only and audited (DP-03).
12. Reference integrity (invariants 2, 3, 11) is validated server-side at write time; a request that supplies inconsistent identifiers is rejected, never partially applied.
13. Existing confirmed bookings are protected from ordinary operator configuration changes (DP-09); changes affecting them require the operator-cancellation workflow with reason, notification, audit, and refund evaluation.

## Booking lifecycle

Proposed states:

```text
PENDING_PAYMENT ──→ CONFIRMED
      │    │            │
      │    │            ├──→ CANCELLED
      │    │            └──→ COMPLETED
      │    └────────→ CANCELLED   (user cancels before payment/expiry)
      └─────────────→ EXPIRED     (hold lapsed; ADR-006)
```

All transitions are conditional atomic updates (ADR-003, ADR-011); illegal transitions are rejected. Cancellation/refund policy parameters remain configurable and require the owner-approved Stage 09 ADR before implementation.

## Payment lifecycle

Proposed states:

```text
NOT_REQUIRED   (₹0 bookings; terminal — ADR-005)

or

CREATED ──→ PENDING ──→ VERIFIED
  │            │
  │            ├──→ FAILED
  │            └──→ EXPIRED
  └────────────────→ VERIFIED  (early provider event/server query; conditional, ADR-011 scenario 5)
```

Refund state is tracked separately so a cancellation does not falsely imply that a provider refund has already completed.

## Stage boundary

Exact MongoDB schema syntax, indexes, validators, transaction implementation, and migrations belong to Stage 03.

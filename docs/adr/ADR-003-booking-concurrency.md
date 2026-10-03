# ADR-003 — Booking Concurrency and Atomic Reservation

- **Status:** Proposed — owner review required
- **Date:** 2026-10-03

## Context
Two users can request the same physical slot and overlapping window concurrently. A read-then-decrement availability counter is not authoritative and is vulnerable to races.

## Decision
Propose slot-level reservation using authoritative booking records plus atomic conflict prevention.

The booking service will:

1. Validate facility, zone, slot, user, vehicle, and time window.
2. Compute authoritative price.
3. Enter an atomic reservation workflow.
4. Ensure no conflicting active booking/hold exists for the same slot and overlapping window.
5. Create the pending booking and any required payment state atomically where a transaction is required.
6. Return a conflict without partial booking state when another request wins the race.

MongoDB transactions are the default mechanism for multi-document invariants. Where a single conditional write can enforce an invariant safely, prefer the simpler atomic operation.

## Important constraint
There is no client-writable `availableSlots` counter. Availability is derived from facility/zone/slot/booking state.

## Consequences
Correctness requires explicit indexes/query strategy and real MongoDB concurrency tests. Exact schema/index design belongs to Stage 03 and exact booking implementation to Stage 09.

## Alternatives rejected
A client-provided availability count or a read-then-write decrement is not acceptable because it cannot reliably establish exclusive reservation under concurrency.

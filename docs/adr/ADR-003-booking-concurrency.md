# ADR-003 — Booking Concurrency and Atomic Reservation

- **Status:** Proposed — owner review required (revised with concrete serialization strategy)
- **Date:** 2026-10-03
- **Supersedes:** the earlier abstract "atomic conflict prevention" wording of this ADR

## Context

Two or more requests can attempt to reserve the same physical slot for overlapping time windows concurrently. The core invariant (also domain invariant 5 in `../architecture/02-domain-model.md`) is:

> For the same physical slot `S`, there must not exist two **active** reservations `A` and `B` with `A.start < B.end AND B.start < A.end`.

"Active" means a booking in `PENDING_PAYMENT` whose hold has not expired (`holdExpiresAt > nowUtc`), or a booking in `CONFIRMED`. Terminal states (`CANCELLED`, `EXPIRED`, `COMPLETED`) do not block new reservations.

A critical technical fact drives this design: **a MongoDB multi-document transaction alone does not enforce this invariant.** Transactions provide snapshot isolation; two concurrent transactions can each read a conflict-free snapshot (no overlapping active booking yet) and both commit, producing a double booking. Correctness requires forcing concurrent reservation attempts for the same slot to **serialize against a shared write conflict point**.

## Decision

Reservation attempts for a given slot are serialized through the **ParkingSlot document**, used as an atomic serialization gate, combined with a transaction-scoped overlap check.

### Serialization point

Every operation that can create or reactivate an interval reservation on a slot must, **inside the same MongoDB transaction**, perform an atomic version increment on that slot's `ParkingSlot` document (a monotonic `reservationVersion` field).

Because MongoDB uses document-level write locking, two concurrent transactions that both increment the same slot document produce a write-write conflict: exactly one proceeds; the other aborts with a transient transaction error. This converts "both readers see no conflict" into "one winner commits, the loser retries and then sees the winner's committed booking."

### Reservation workflow (booking creation)

1. **Pre-validation (outside transaction, reads only):** facility exists and is active; zone belongs to facility; slot belongs to zone (and therefore facility); authenticated user owns the referenced vehicle; time window valid per ADR-004 (facility-local interpretation, operating hours, duration bounds); operator approval status permits bookings at the facility (see `../architecture/02-domain-model.md`).
2. **Pricing (server-authoritative):** compute the authoritative price snapshot from facility pricing rules. The client never supplies subtotal, tax, discount, total, or payment status.
3. **Transaction boundaries — start a multi-document transaction** (replica set required; read concern `snapshot`, write concern `majority`) that performs exactly these writes:
   1. Increment `reservationVersion` on the target `ParkingSlot` document (serialization gate).
   2. **Overlap check:** query bookings for the same `slotId` where the active-state predicate holds and intervals overlap (`existing.start < requested.end AND requested.start < existing.end`). The predicate treats a `PENDING_PAYMENT` booking with `holdExpiresAt <= nowUtc` as non-active, so expired-but-not-yet-swept holds never block new reservations.
   3. If a conflict exists → abort the transaction and return a `BOOKING_CONFLICT` error. No partial state exists because the transaction rolled back.
   4. If no conflict → insert the booking (`PENDING_PAYMENT` with server-generated `holdExpiresAt` for payable bookings; see the ₹0 path below) and insert its payment record in the same transaction.
   5. Commit.
4. **₹0 bookings:** identical path; the payment record is created with status `NOT_REQUIRED` and the booking transitions to `CONFIRMED` **within the same reservation transaction** (no hold applies, so `holdExpiresAt` is not set and the hold-based confirmation predicate is not used). Per ADR-005/ADR-011.

### How a losing concurrent request behaves

- The loser's transaction aborts on the slot-document write conflict (transient transaction error), **not** on the overlap query.
- The service retries the whole transaction a bounded number of times (small backoff; exact values are a Stage 09 tuning parameter). On retry, the overlap check now sees the winner's committed booking, and the request terminates as a clean `BOOKING_CONFLICT` (HTTP 409, generic client-safe message per `../architecture/03-api-conventions.md`).
- Retry exhaustion due to sustained contention is also reported as a conflict/retryable error, never as a partial booking.

### Stale and failed transactions

- Aborted or crashed transactions leave **no** persisted state (atomic rollback); no cleanup of partial bookings is ever required.
- Transactions are bounded by an explicit maximum transaction lifetime so a stalled transaction cannot hold the slot write lock indefinitely; a stalled attempt fails transiently and the client may retry (idempotently — see `../architecture/03-api-conventions.md` §Idempotency).
- A commit that fails after provider-side effects (e.g., a Razorpay order was already created before the transaction) is handled by the reconciliation rules in ADR-011, not by trusting the client.

### Pending holds and expiry

- A payable booking is created as `PENDING_PAYMENT` with `holdExpiresAt` (server-generated UTC instant; duration policy per ADR-006/DP-04).
- While active, the hold participates fully in overlap checks — it reserves the slot.
- **Expiry processing** is a conditional single-document atomic transition: update to `EXPIRED` only where the document still matches `PENDING_PAYMENT AND holdExpiresAt <= nowUtc`. This is idempotent, safe to run from concurrent sweepers, requires no slot-gate transaction (it only removes an interval from the active set), and produces an auditable state transition.
- Availability queries exclude expired holds via the same active-state predicate, independent of sweeper timing.

### Payment confirmation (hold → confirmed)

- Confirmation is a **conditional atomic transition** on the booking: `PENDING_PAYMENT → CONFIRMED` only where `holdExpiresAt > nowUtc` and the payment record is independently `VERIFIED` (server-verified provider event/response per ADR-005).
- A payment success event arriving **after** hold expiry never resurrects the booking; it follows the late-payment reconciliation path in ADR-011 (refund/compensation, decided server-side).
- Because confirmation narrows (does not create) the reserved interval — the booking already held it — the transition does not require the slot-gate transaction; the conditional predicate plus the pre-existing hold is sufficient to preserve the no-overlap invariant.

### Cancellation

- User- or operator-initiated cancellation is a conditional atomic transition (`CONFIRMED → CANCELLED`, or `PENDING_PAYMENT → CANCELLED` before expiry) with mandatory reason capture for operator-initiated cases (DP-09). Cancellation only removes an interval from the active set and therefore needs no slot-gate transaction.
- Refund evaluation is recorded separately and idempotently (ADR-011); a cancellation is never contingent on refund completion, and a refund never mutates booking state.

### Failure recovery summary

| Failure | Recovery |
|---|---|
| Transaction aborts (write conflict) | Bounded retry of whole transaction; then clean conflict response |
| Process crash mid-transaction | Automatic rollback; nothing persisted; client retry is idempotent |
| Commit succeeds, response lost | Idempotency key returns the stored result on retry |
| Hold expires during payment | Late-payment path in ADR-011; booking stays `EXPIRED` |
| Sweeper runs twice on same hold | Conditional predicate makes second run a no-op |

## Rationale

- The slot-document version increment is the minimal MongoDB-native mechanism that forces serialization for arbitrary time intervals on one slot, without extra infrastructure (no Redis/lock service) and without constraining bookings to a fixed time grid.
- Keeping the overlap check inside the same transaction as the gate write guarantees the check and the insert commit or abort together.
- Conditional single-document transitions for expiry/confirmation/cancellation keep the common paths cheap while preserving the invariant, consistent with `../architecture/01-system-architecture.md` §Consistency strategy.

## Alternatives considered

- **Transactions without a serialization point** — rejected: snapshot isolation permits two conflict-free reads to both commit (double booking).
- **Unique index on (slotId, time bucket)** — rejected as the sole mechanism: only enforces non-overlap for fixed-grid intervals; ParkEase allows arbitrary start/end times. (Bucket-based indexes may later supplement, not replace, the gate; Stage 03 may evaluate.)
- **In-process mutex/lock map** — rejected: fails with more than one API instance.
- **External distributed lock (e.g., Redis)** — rejected for now: additional infrastructure and lock-expiry failure modes; the MongoDB document lock already provides the needed serialization.
- **Read-then-write availability counter** — rejected (original ADR): not authoritative, race-prone, and forbidden by AGENTS.md.

## Consequences

- MongoDB must run as a replica set in every environment that creates bookings (including local development/testing — see ADR-008 Docker replica set).
- All interval-creating operations must use the gate; this is an architectural rule, and Stage 09 implementation must not add booking-creation paths that bypass it.
- `ParkingSlot` gains a monotonic `reservationVersion` concept; exact schema/index design remains Stage 03.
- Bounded retries add small tail latency under contention on a single slot; acceptable for the expected scale.

## Security implications

- Conflict responses are generic and must not reveal other users' booking details or existence beyond "slot unavailable".
- The serialization gate is server-internal; clients cannot influence `reservationVersion`, hold expiry, or the active-state predicate.
- Retry loops must be rate-limited to prevent contention amplification as a denial-of-service vector.

## Testing implications

Stage 09 must include, against a real MongoDB replica set:

1. N parallel booking attempts for the same slot and overlapping window → exactly one active booking; all others receive clean conflicts (SC-1).
2. Parallel attempts for the same slot with **non-overlapping** windows → both succeed.
3. Retry-path test: forced transient abort converges to conflict or success, never duplicate.
4. Hold expiry vs. payment confirmation race in both orderings.
5. Expired-but-unswept hold does not block a new booking; sweeper idempotency under double execution.
6. Cancellation frees the interval for rebooking; cancellation racing confirmation is resolved by conditional predicates.
7. Crash/abort mid-transaction leaves no partial booking or payment state.

# ADR-006 — Pending Booking Holds and Expiry

- Status: Proposed — exact policy deferred
- Date: 2026-10-03
- Decision point: DP-04

## Decision
A non-zero booking that requires payment uses a bounded PENDING_PAYMENT hold so abandoned payment attempts do not permanently consume a slot.

The hold belongs to the booking, has a server-generated expiration instant, participates in availability/conflict checks while active, and becomes EXPIRED when its payment window ends. Expiry releases the reservation without treating expiry as cancellation/refund.

The exact duration remains intentionally deferred to Stage 09 for an owner-approved ADR (DP-04). The architecture-level expiry **mechanism** is now defined: a conditional, idempotent single-document transition executed by a sweeper, with the active-state predicate and late-payment behavior specified in **ADR-003** (§Pending holds and expiry) and **ADR-011** (scenarios 2 and 8).

## Required design properties
- Expiry must be safe under concurrent payment confirmation.
- A late payment event must not resurrect an expired booking without an explicit, validated recovery rule (recovery rule: ADR-011 scenario 8 — no resurrection; server-initiated refund path).
- Expiry processing must be idempotent.
- Availability queries must exclude expired holds.
- Expiry must leave an auditable state transition.

These properties are satisfied by the ADR-003 conditional-transition design; Stage 09 implements and tests them.

## Consequences
The domain model must represent expiration explicitly. Stage 09 must test boundary timing, retries, races between expiry and payment confirmation, and UTC comparisons.

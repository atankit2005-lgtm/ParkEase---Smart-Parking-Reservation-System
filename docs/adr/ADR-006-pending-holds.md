# ADR-006 — Pending Booking Holds and Expiry

- Status: Proposed — exact policy deferred
- Date: 2026-10-03
- Decision point: DP-04

## Decision
A non-zero booking that requires payment uses a bounded PENDING_PAYMENT hold so abandoned payment attempts do not permanently consume a slot.

The hold belongs to the booking, has a server-generated expiration instant, participates in availability/conflict checks while active, and becomes EXPIRED when its payment window ends. Expiry releases the reservation without treating expiry as cancellation/refund.

The exact duration and operational mechanism are intentionally deferred to Stage 09 for an owner-approved ADR.

## Required design properties
- Expiry must be safe under concurrent payment confirmation.
- A late payment event must not resurrect an expired booking without an explicit, validated recovery rule.
- Expiry processing must be idempotent.
- Availability queries must exclude expired holds.
- Expiry must leave an auditable state transition.

## Consequences
The domain model must represent expiration explicitly. Stage 09 must test boundary timing, retries, races between expiry and payment confirmation, and UTC comparisons.

# ADR-011 — Booking / Payment State Consistency

- **Status:** Proposed — owner review required
- **Date:** 2026-10-03
- **Related:** ADR-003 (reservation serialization), ADR-005 (payment authority), ADR-006 (pending holds), `../architecture/02-domain-model.md` (lifecycles)

## Context

Booking state and payment state live in two coupled but distinct state machines, and payment additionally involves an external provider (Razorpay) that no local transaction can span. Failures, races, and duplicate/delayed provider events are normal, not exceptional. Without an explicit consistency model, the system risks confirmed-unpaid bookings, paid-expired bookings with retained money, double refunds, or client-trusted outcomes.

The governing invariant set:

- **I1:** A booking is `CONFIRMED` only if its payment record is `VERIFIED` (or `NOT_REQUIRED` for ₹0) — server-verified, never client-asserted.
- **I2:** A `VERIFIED` payment attached to a non-`CONFIRMED` booking is a detected, reconcilable anomaly with a mandatory resolution path — never a silently retained amount.
- **I3:** Every state transition is a conditional atomic update; no transition is unconditional.
- **I4:** No client input (frontend callback, claimed status, claimed amount) participates in establishing payment truth.

## Decision

### Coupling model

- Booking and payment records for one booking are created **in the same MongoDB transaction** (ADR-003 step 3), so intra-database partial state is impossible.
- The confirmation transition (`PENDING_PAYMENT → CONFIRMED`) is conditional on: payment status `VERIFIED`, `holdExpiresAt > nowUtc`, and the booking still being `PENDING_PAYMENT`. It is executed as a single-document atomic update; the slot interval was already reserved by the active hold, so no re-gating is needed (ADR-003).
- Payment `VERIFIED` is established **only** by server-side validation of a signed provider webhook and/or server-side re-query of the provider using the stored provider order/payment references (ADR-005). Both channels feed the same verification routine, which is idempotent.
- A **reconciliation worker** (idempotent, auditable, Stage 10 implementation) periodically sweeps for invariant violations (I2) and drives them to resolution. It never trusts client state.

### Required failure/race scenarios

| # | Scenario | Required behavior |
|---|---|---|
| 1 | Provider payment succeeds, booking confirmation fails (crash/error between verification and transition) | Payment stays `VERIFIED`; booking stays `PENDING_PAYMENT` with active hold → reconciliation (or the confirmation retry) completes the conditional transition. If the hold expires first, scenario 8 applies. Client retry of confirmation is safe (idempotent, conditional). |
| 2 | Booking hold expires while payment is pending | Expiry sweeper conditionally transitions `PENDING_PAYMENT → EXPIRED` (ADR-006). The provider order may still exist but is never confirmed into a booking; if money is later captured, scenario 8 applies. |
| 3 | Duplicate webhook arrives | Provider **event identity** is the idempotency key (`03-api-conventions.md` §Idempotency): first delivery processes; duplicates are acknowledged and recorded but cause no second state change. |
| 4 | Webhook arrives before the frontend receives the provider response | Ordering is irrelevant: both channels converge on the same idempotent verification routine. The frontend result is informational; the client-visible booking status comes only from server state (polled or returned by the verification endpoint). |
| 5 | Payment verification succeeds twice (both channels race) | The `→ VERIFIED` transition is conditional (from `CREATED`/`PENDING` only); the second verification is a recorded no-op. Confirmation, notifications, and any downstream effects fire exactly once. |
| 6 | Refund requested after cancellation | Cancellation triggers refund **evaluation** (DP-13 policy); refund execution is a separate idempotent operation bound to the triggering event: one `VERIFIED` payment yields at most the policy-permitted refund total. A completed refund is never re-executed; a failed refund is retried by reconciliation only, never by client request alone. Refund state is tracked on Refund records so cancellation never falsely implies refund completion (02-domain-model.md). |
| 7 | ₹0 booking | No provider interaction. Payment record created as `NOT_REQUIRED` inside the reservation transaction; `NOT_REQUIRED` is a terminal payment status that can never transition to/from provider states. The booking is confirmed **within the same transaction** after normal validation (ADR-003 step 4, ADR-005). Refund concepts do not apply. |
| 8 | Payment succeeds **after** the hold expired | The booking is **not resurrected** (ADR-003/ADR-006): `EXPIRED` is terminal for the reservation. A `VERIFIED` payment on an `EXPIRED` booking is an I2 anomaly → mandatory server-initiated resolution: default full refund via the provider, audited, with user notification. (Exact compensation policy — refund vs. rebooking offer — is finalized in the Stage 10 owner-approved payment policy; refund is the architectural default.) The slot may already be rebooked by another user; that booking is untouched. |
| 9 | One side commits, the other fails (cross-system boundary) | Local booking+payment writes share one MongoDB transaction: commit failure leaves **no** local state. The provider order created before that transaction is inert if unpaid and lapses provider-side. If the provider nonetheless reports a capture against an order with no matching local booking (or one rolled back), webhook verification rejects/flags the unknown reference → reconciliation records it, and any captured amount follows the scenario-8 refund path. Money is never retained without an auditable booking/payment state. |

### Authority rules (restated)

- Server calculates the authoritative amount; the provider order is created for that amount only. A provider event whose amount/currency/order reference does not match the stored server-side expectation fails verification → anomaly path, not confirmation.
- Payment status, booking status, and refund status are never writable by clients.
- Client-side "payment success" screens have no authority; the server's conditional transitions are the only path to `CONFIRMED`.

## Rationale

Conditional transitions plus one transaction boundary inside MongoDB reduce the cross-system problem to a single unavoidable edge (provider ↔ application), which is handled by idempotent verification and an auditable reconciliation worker. This is the smallest consistency model that satisfies SC-3 and the old-project regression checks without introducing sagas, event buses, or a workflow engine (AGENTS.md complexity constraint).

## Alternatives considered

- **Two-phase confirmation trusting the frontend callback (`razorpay_payment_id` from the browser)** — rejected: client input cannot establish truth (I4); used at most as a hint that triggers server-side verification.
- **Saga/orchestrator framework** — rejected as over-engineering for one provider and one coupled state pair; the reconciliation worker covers the same ground.
- **Auto-resurrect expired bookings on late payment** — rejected: violates ADR-006 and can double-book the slot; refund-by-default is the safe resolution (scenario 8).
- **Blocking synchronous webhook processing with retries from the provider as the only channel** — rejected: provider retry behavior is outside our control; verification must be idempotent and dual-channel.

## Consequences

- Stage 10 must implement: idempotent verification routine, conditional transitions exactly as specified, reconciliation worker with audit trail, refund automation for scenario 8, and provider-reference integrity checks (amount/currency/order match).
- Operational dashboards must surface open I2 anomalies; an anomaly aging past a configured threshold is an alerting condition (Stage 15 observability).
- Notification content for late-payment refunds is server-generated (Stage 11).

## Security implications

- Webhook signature validation and event-identity deduplication are mandatory entry controls (threat model: fake payment success, webhook replay).
- Amount/currency/order-reference matching prevents amount-tampering via provider payloads.
- Reconciliation and refund actions are privileged, audited operations (05-authorization-matrix.md: payment oversight / refund execution is ADMIN + server automation, never operator or client initiated).

## Testing implications

Stage 10 tests must cover each scenario above, including: duplicate webhook deliveries, webhook-before-frontend and frontend-before-webhook orderings, double verification race, confirmation retry after crash, late payment on expired hold (refund path, no resurrection, no effect on a subsequent rebooking), amount-mismatch rejection, refund idempotency under concurrent triggers, and ₹0 full-path (no provider calls, `NOT_REQUIRED` terminal).

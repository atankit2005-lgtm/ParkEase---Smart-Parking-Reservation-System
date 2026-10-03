# 05 — Core Workflows

Each workflow lists the happy path, mandatory server-side controls, and key failure paths. Controls referenced by ID are mandatory; they are test targets in the implementing stage.

## W1 User registration
Register → validate (schema) → check uniqueness → hash password → create account with role USER → issue session/token → authenticated.
- Controls: FR-AUTH-01/02/05/06, SEC-03. Role and any privileged fields from the body are rejected.
- Failures: duplicate email (generic error where enumeration matters), weak password, rate-limit exceeded.

## W2 Parking discovery
Search → filter → view facility → inspect availability for a window → inspect pricing.
- Controls: FR-DISC-01..03. Availability computed from slots + bookings + operating hours + blocked slots; pagination and query-index use.
- Failures: invalid window/geo parameters → validation error; no results → empty state.

## W3 Booking
Select facility → select/assign valid slot → validate availability and time rules → compute authoritative price → create pending booking atomically (hold) → initiate payment (or apply the DP-17 zero-cost/payment-exempt path) → provider-verified confirmation where payment is required → confirm booking → notify user.
- Controls: FR-BKG-01..05, 08, 09; FR-PAY-01..04; owner from auth identity only; atomic reservation (transaction or equivalent conditional write, chosen in Stage 01/03).
- Failures: slot taken concurrently → conflict response, no partial state; payment fails/never arrives → hold expires, capacity released; duplicate webhook → no double confirmation; booking confirmed only if payment verified.

## W4 Cancellation
Request cancel → authenticate → verify ownership → validate status and policy → transition to cancelled → release capacity → evaluate and initiate refund → notify.
- Controls: FR-BKG-07, FR-PAY-05. Repeat cancel is idempotent; completed/expired bookings are not cancellable; refund amount computed server-side from policy.
- Failures: not owner → 404/403 per policy decision (avoid leaking existence); refund provider failure → refund recorded as pending/failed and retried/reconciled, booking state remains consistent.

## W5 Operator
Operator signs in (approved operator) → manage facility → zones → slots → hours → pricing → monitor bookings/occupancy.
- Controls: FR-OPR-01..03; scope = owned facilities; audited changes; changes affecting future confirmed bookings follow DP-09.

## W6 Admin
Admin signs in → manage platform → review users/operators → review facilities → review bookings/payments → review moderation and audit information.
- Controls: FR-ADM-01..03; all privileged actions audited; audit view read-only.

## W7 Review (supporting)
Completed booking → eligible user submits one review → validated → stored → rating recomputed server-side → admin may moderate.

## W8 Recommendation (supporting)
Request recommendations → server gathers permitted inputs → ranks facilities → returns advisory list; any selection still goes through W3 with full validation.

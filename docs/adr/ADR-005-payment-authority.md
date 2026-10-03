# ADR-005 — Payment Authority and Zero-Cost Bookings

- Status: Proposed — owner review required
- Date: 2026-10-03
- Decision points: DP-07, DP-17

## Decision
Razorpay is the initial payment provider and INR is the initial currency.

The server owns the payable amount, currency, payment state, booking/payment association, provider verification result, and refund state. Client-supplied amount, status, or payment-success fields are never authoritative.

For an authoritative booking amount of ₹0:
- no external Razorpay transaction is created;
- the booking follows the same validation and atomic reservation path;
- a payment record is created for auditability with NOT_REQUIRED status;
- the booking may transition to confirmed only after normal server-side booking validation succeeds.

For non-zero bookings, provider verification establishes payment success. Signatures/webhooks are verified server-side, duplicate/out-of-order provider events are idempotent, and raw card data is never stored.

## Consequences
Payment integration can be replaced behind an interface without changing booking authority. Reconciliation remains necessary because provider state and application state can diverge temporarily.

## Deferred
Exact Razorpay API integration, webhook endpoints, signature implementation, retry policy, refund implementation, and reconciliation jobs belong to Stage 10.

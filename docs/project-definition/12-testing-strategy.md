# 12 — Testing Strategy

Testing is mandatory and risk-weighted. A passing happy-path suite is not sufficient; negative and abuse cases are required.

## Levels
Unit · Integration · API · Authorization · Security · Database/Transaction · Frontend component · End-to-end · Regression.

## High-risk areas (highest coverage and rigor)
Authentication, authorization, ownership, booking, availability, concurrency, payments, cancellation, refunds, role boundaries.

## Required test classes
- **Authorization matrix**: for each protected route — unauthenticated, wrong role, right role/wrong owner, right role/right owner (03).
- **Route inventory test**: every route has a declared policy (NFR-SEC-02).
- **Concurrency**: parallel booking attempts for the same slot/window yield exactly one active booking, run against real MongoDB (in-memory/ephemeral replica set as needed for transactions).
- **Payment**: forged/invalid signature rejected; duplicate and out-of-order events; amount tampering ignored; payment-failure releases hold.
- **State machines**: valid and invalid transitions for booking and payment.
- **Validation**: malformed, oversized, unexpected-field (mass assignment), injection-style payloads.
- **Time**: boundaries, time zones, DST, operating hours, past dates.
- **Regression**: one test per RC-* item in 02 when its code lands.
- **Frontend**: loading/error/empty states, form validation, role-based UI (UX only), accessibility checks.
- **E2E**: registration → search → book → pay (test mode) → cancel/refund.

## Practices
Deterministic tests; no reliance on the live payment provider (provider behind an interface; sandbox for explicit integration tests); test data factories; CI runs the full suite; coverage is a signal, not a goal — risk coverage is judged in audits. Bugs get a failing test first where practical.

## Stage 00
Documentation-only: validation is consistency review and independent reading, not executable tests.

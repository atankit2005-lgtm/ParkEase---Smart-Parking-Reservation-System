# 07 — Technical Constraints & Decision Points

## Constraints (mandatory)
1. **MERN is mandatory**: MongoDB, Express.js, React, Node.js.
2. **MongoDB is mandatory** and must be used as a first-class database (schema validation, indexes, compound/unique constraints, transactions or equivalent atomic strategy). No substitution by PostgreSQL, MySQL, Firebase, Supabase, etc.
3. TypeScript is preferred/expected for new code (final scope of TS adoption: Stage 01).
4. The project must remain understandable; no unnecessary architectural complexity or dependencies.
5. Security is not traded for speed; no intentional demo-only security holes.
6. AI agents cannot override requirements (see 08).
7. No production secrets in Git.
8. No fake payment verification; no client-authoritative price, ownership, status, or payment state.
9. No insecure role bypasses; no uncontrolled mass assignment; no trusting client ownership claims.
10. No raw card data stored.
11. Parking availability must not rely on a single client-writable `availableSlots` counter; the model must represent facility, zone, slot, and booking as appropriate.

## Technology direction (not yet locked)
Expected: Mongoose, Vite, Tailwind CSS, GitHub Actions, Docker, testing frameworks, a payment provider, a maps/location provider. Final selection belongs to Stage 01 and Stage 02.

## Decision points

Owner-approved decisions for the initial product direction are recorded here. Detailed Stage 01 architecture decisions shall be captured in Stage 01 ADRs; later-stage policy details remain explicitly deferred.

| ID | Decision | Status / owner decision |
|---|---|---|
| DP-01 | Monorepo vs separate client/server packages; folder layout | Deferred to Stage 01 architecture ADR |
| DP-02 | Auth token model, CSRF strategy, revocation | **Resolved — A:** server-managed sessions with httpOnly secure cookies; CSRF protection, appropriate SameSite settings, session rotation, expiration, and server-side invalidation; no localStorage/sessionStorage auth tokens |
| DP-03 | Operator onboarding; admin bootstrap/promotion | **Resolved:** ADMIN approval required for operators; initial ADMIN created by documented, secure, idempotent deployment-time bootstrap; no first-registration admin |
| DP-04 | Pending-booking hold duration and expiry mechanism | Deferred to Stage 01/09; exact duration and mechanism require ADR |
| DP-05 | Whether unauthenticated visitors may see availability and exact pricing | **Resolved — A:** public availability and exact pricing; authentication required for booking and personal information |
| DP-06 | Slot-level selection vs zone-capacity booking; per-facility configurability | **Resolved — A:** slot-only booking; facilities contain zones and zones contain physical slots; no zone-capacity-only or per-facility booking-mode configuration initially |
| DP-07 | Payment provider and currency/tax handling; test-mode strategy | **Resolved:** Razorpay; INR; test mode in development; explicit production configuration; server-authoritative pricing/tax; configurable tax rules finalized before production payment integration |
| DP-08 | Email provider; other channels | Deferred to Stage 11 |
| DP-09 | Rules when operators close/modify slots or cancel with existing confirmed bookings | **Resolved — C:** ordinary changes must not invalidate confirmed bookings; emergency impact requires explicit operator-cancellation workflow, mandatory reason, user notification, audit logging, and applicable refund evaluation |
| DP-10 | Recommendation approach, data used, opt-out, retention/deletion | Deferred to Stage 12; Stage 01 will define only the architecture boundaries needed to preserve these decisions |
| DP-11 | Which user data operators may see for bookings at their facilities | **Resolved in principle:** minimum necessary PII only, consistent with the existing role boundary; exact field-level visibility to be finalized in Stage 01 authorization ADR |
| DP-12 | Numeric performance targets | Deferred to Stage 01; targets require owner-approved ADR before implementation/testing claims depend on them |
| DP-13 | Cancellation/refund policy parameters | **Resolved as configurable, details deferred:** system supports configurable cancellation/refund policies; exact windows, percentages, fees, and no-show rules require owner-approved ADR before Stage 09; operator-initiated cancellation defaults to full refund subject to finalized policy and payment reconciliation |
| DP-14 | Time-zone model and supported regions/currencies | **Resolved:** India initially; INR initially; timestamps persisted in UTC; every facility stores IANA timezone; operating hours and booking validation use facility-local time; internationalization/multiple currencies deferred |
| DP-15 | Hosting/deployment targets; MongoDB Atlas tier | Deferred to Stage 02; deployment target and Atlas tier require an ADR before infrastructure implementation |
| DP-16 | Repository license | Deferred to Stage 16 |
| DP-17 | Zero-cost/payment-exempt bookings | **Resolved — A:** authoritative ₹0 bookings bypass external payment; all normal booking validation and atomic reservation rules still apply; auditable zero-payment record uses distinct `NOT_REQUIRED` payment status |

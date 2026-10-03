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

## Decision points (unresolved — owner input or later-stage ADR required)
| ID | Decision | Needed by |
|---|---|---|
| DP-01 | Monorepo vs separate client/server packages; folder layout | Stage 01 |
| DP-02 | Auth token model (e.g., httpOnly-cookie session vs short-lived access + refresh tokens), CSRF strategy, revocation | Stage 01 (implemented 05) |
| DP-03 | Operator onboarding (admin approval proposed); admin account bootstrap and promotion process | Stage 01/05 |
| DP-04 | Pending-booking hold duration and expiry mechanism | Stage 01/09 |
| DP-05 | Whether unauthenticated visitors may see availability and exact pricing | Owner, Stage 01 |
| DP-06 | Slot-level selection vs zone-capacity booking; per-facility configurability | Owner, Stage 01/03 |
| DP-07 | Payment provider and currency/tax handling; test-mode strategy | Owner, Stage 01/10 |
| DP-08 | Email provider; other channels | Stage 11 |
| DP-09 | Rules when operators close/modify slots or cancel with existing confirmed bookings; operator-initiated cancellation and refunds | Owner, Stage 01/09 |
| DP-10 | Recommendation approach (rules/statistical vs model/LLM), data used, user opt-out, retention/deletion policy | Owner, Stage 01/12 |
| DP-11 | Which user data operators may see for bookings at their facilities | Owner, Stage 01/13 |
| DP-12 | Numeric performance targets (latency, load) | Stage 01 |
| DP-13 | Cancellation/refund policy parameters (windows, fees) | Owner, Stage 01/09 |
| DP-14 | Time-zone model (store UTC; facility-local zone for hours and display) and supported regions/currencies | Stage 01 |
| DP-15 | Hosting/deployment targets; MongoDB Atlas tier (transactions require replica set) | Stage 01/02 |
| DP-16 | Repository license | Owner, Stage 16 |

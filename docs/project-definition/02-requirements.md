# 02 — Requirements

Requirement IDs are stable. Reference them in commits, tests, and PRs. "Shall" = mandatory. Items needing owner input are listed as decision points (DP-xx) in `07-technical-constraints.md` and are not silently resolved here.

## Functional requirements

### Authentication & account security (AUTH)
- FR-AUTH-01 Users shall register with validated email and password; duplicate emails are rejected.
- FR-AUTH-02 Passwords shall be stored only as salted, adaptive hashes (algorithm chosen in Stage 01/05).
- FR-AUTH-03 Users shall log in, log out, and have sessions/tokens that can be invalidated server-side.
- FR-AUTH-04 Users shall be able to change and reset passwords through a time-limited, single-use mechanism.
- FR-AUTH-05 Login and credential endpoints shall be rate-limited; responses shall not reveal whether an email exists.
- FR-AUTH-06 Role shall never be accepted from client input at registration or profile update.

### User management (USR)
- FR-USR-01 Users shall view and edit their own profile (allow-listed fields only).
- FR-USR-02 Users shall manage their own vehicles (create, list, update, delete); a booking references a vehicle owned by the booker.
- FR-USR-03 Users shall manage preferences and favorites.

### Parking discovery (DISC)
- FR-DISC-01 Users (including unauthenticated visitors, subject to DP-05) shall search/filter/sort facilities by text, location/radius, price, availability window, and amenities.
- FR-DISC-02 Facility detail shall show location, operating hours, zones, pricing, rating, and availability for a requested window.
- FR-DISC-03 Availability shown shall be computed server-side from real slot/booking data, never from a client-writable counter.

### Booking (BKG)
- FR-BKG-01 Users shall create a booking for a facility/zone/slot and a validated time window; the server selects or validates the slot.
- FR-BKG-02 The server shall compute price from pricing rules; client-supplied price/amount is ignored.
- FR-BKG-03 The booking owner is derived from the authenticated identity only.
- FR-BKG-04 Concurrent attempts for the same slot and overlapping window shall result in at most one active booking.
- FR-BKG-05 Booking status transitions shall follow a defined state machine; illegal transitions are rejected.
- FR-BKG-06 Users shall list and view only their own bookings; operators only bookings of facilities they own; admins all (audited).
- FR-BKG-07 Cancellation shall be owner-only, policy-validated, idempotent (repeat cancel is a safe no-op or clear error), and shall release capacity and trigger refund evaluation.
- FR-BKG-08 All times shall be validated (start < end, not in the past beyond tolerance, within operating hours, within max duration) with explicit time-zone handling.
- FR-BKG-09 Unpaid pending bookings shall hold capacity only for a bounded period, then expire and release it (duration: DP-04).

### Payments (PAY)
- FR-PAY-01 Payment amount shall be server-calculated and bound to the booking.
- FR-PAY-02 Payment initiation and confirmation shall use a payment provider; success is established only by provider-verified server-side confirmation (signature/webhook verification).
- FR-PAY-03 Payment handling shall be idempotent and tolerate duplicate, delayed, and out-of-order provider events.
- FR-PAY-04 Payment state machine and booking state shall remain consistent (booking confirmed iff payment verified).
- FR-PAY-05 Refunds shall follow cancellation policy and be recorded and reconcilable.
- FR-PAY-06 Users see only their own payment history; raw card data is never stored or logged.

### Notifications (NOT)
- FR-NOT-01 In-app notifications for booking, payment, cancellation, and refund events.
- FR-NOT-02 Email notifications for key events (provider: DP-08). Other channels only with justification.
- FR-NOT-03 Notification content shall not leak sensitive data.

### Reviews (REV)
- FR-REV-01 Only users with a completed booking at a facility may review it; one review per completed booking.
- FR-REV-02 Authors may edit/delete own reviews; admins may moderate (audited).
- FR-REV-03 Facility rating is computed server-side from stored reviews.

### Operator (OPR)
- FR-OPR-01 Operators manage only facilities they own: facilities, zones, slots, operating hours, pricing rules.
- FR-OPR-02 Operators view occupancy, bookings, and revenue for owned facilities only.
- FR-OPR-03 Changes that affect existing confirmed bookings (e.g., closing a slot) shall be handled by defined rules (DP-09).

### Admin (ADM)
- FR-ADM-01 Admins manage users, operators, facilities; oversee bookings and payments; moderate reviews.
- FR-ADM-02 Admins view audit logs and platform analytics; audit logs are append-only and not editable via the application.
- FR-ADM-03 Every privileged admin/operator action writes an audit record (actor, action, target, time, outcome).

### AI (AI)
- FR-AI-01 Recommendations rank facilities using preferences, history, and demand/occupancy signals.
- FR-AI-02 AI output is advisory only; it shall never decide availability, price, payment, booking state, or authorization.
- FR-AI-03 Recommendation inputs shall respect privacy (data minimization, user control — details DP-10).

## Security requirements (SEC)
- SEC-01 All authorization, ownership, validation, and pricing is enforced server-side; frontend checks are UX only.
- SEC-02 Deny by default: every route declares its authentication and role requirement; tests assert it.
- SEC-03 Schema-level input validation on every endpoint; unknown fields are rejected or stripped (no mass assignment).
- SEC-04 Secrets only via environment/secret manager; none in Git; `.env.example` contains placeholders only.
- SEC-05 CORS allow-list configured per environment; secure headers; rate limiting on abuse-prone routes.
- SEC-06 Token/session model chosen deliberately (DP-02) and documented with XSS/CSRF analysis.
- SEC-07 Query-injection and XSS defenses (operator-injection-safe queries, output encoding).
- SEC-08 Errors returned to clients are generic; stack traces and internals are never exposed; logs exclude passwords, secrets, tokens, and payment data.
- SEC-09 Webhooks are signature-verified and replay/duplicate-safe.
- SEC-10 Dependencies are minimal, pinned via lockfile, and audited.

## Regression checks from the old implementation
Each item must become an explicit automated test or audit checklist item in the stage that introduces the relevant code. Evidence from inspection of the old repository is noted where verified.

| ID | Old weakness | Evidence in old repo | Required in rebuild |
|---|---|---|---|
| RC-01 | User ID trusted from request body | `createBooking` reads `user` from `req.body` | SEC-01, FR-BKG-03 |
| RC-02 | User ID in URL without ownership check | `GET /bookings/user/:userId` with auth only | FR-BKG-06 |
| RC-03 | Cancel without ownership validation | `PUT /bookings/:id/cancel` with auth only | FR-BKG-07 |
| RC-04 | Admin/listing endpoints protected only by authentication | `GET /bookings`, `GET /payments` with auth only | SEC-02, FR-ADM-* |
| RC-05 | Unauthenticated dashboard | `GET /dashboard` has no middleware | SEC-02 |
| RC-06 | Client-controlled payment success and amount | `createPayment` accepts `amount`, sets status `Success` | FR-PAY-01..04 |
| RC-07 | No provider verification | No provider integration present | FR-PAY-02 |
| RC-08 | Race condition on availability | read `availableSlots`, then decrement non-atomically | FR-BKG-04, FR-DISC-03 |
| RC-09 | Capacity not restored on cancel | `cancelBooking` sets status `Cancelled` and does not increment `availableSlots` | FR-BKG-07 |
| RC-10 | JWT weaknesses | Single 7-day token, no revocation; payload trusted as-is | FR-AUTH-03, SEC-06 |
| RC-11 | localStorage auth without a security model | `AuthContext.jsx` stores `parkease_token` and user in localStorage | SEC-06 |
| RC-12 | Mass assignment | `Model.create` from raw body fields | SEC-03, FR-AUTH-06 |
| RC-13 | Missing server-side validation / transactions | Validation files exist but not applied to all routes; no transactions | SEC-03, FR-BKG-04 |
| RC-14 | Hardcoded localhost URLs | `localhost` appears in `src/services/api.js` and `backend/server.js` | Env-based config |
| RC-15 | Open CORS | `app.use(cors())` | SEC-05 |
| RC-16 | Internal error messages returned | `message: error.message` in controllers | SEC-08 |
| RC-17 | Stale documentation | README describes mock auth/backend "team" | 13-documentation-strategy |
| RC-18 | Fake/demo admin security | Mock auth in frontend | SEC-01 |

Note: evidence reflects a Stage 00 inspection of the old repository's `main` branch (shallow clone). RC-07 (no provider) and RC-10 (token handling) rest on a partial read of the code; confirm during Stage 01 if they affect design.

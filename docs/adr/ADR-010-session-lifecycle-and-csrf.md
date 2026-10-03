# ADR-010 — Session Lifecycle and CSRF Architecture

- **Status:** Proposed — owner review required
- **Date:** 2026-10-03
- **Decision point:** DP-02 — owner resolved A (this ADR expands ADR-002 into an explicit lifecycle/CSRF architecture)

## Context

ADR-002 establishes server-managed opaque sessions with httpOnly secure cookies and states that CSRF protection is required. Stage 01 review found the CSRF and lifecycle architecture too abstract: it did not define cookie properties, the SameSite strategy, the CSRF defense mechanism, rotation triggers, revocation semantics, or privileged-session handling. This ADR defines that architecture without implementing it (implementation belongs to Stages 04–05).

JWT-based authentication and localStorage/sessionStorage token storage remain prohibited (DP-02, AGENTS.md).

## Decision

### Cookie architecture

- The session credential is an opaque, high-entropy, server-generated identifier stored in a cookie with, at minimum: `HttpOnly`, `Secure`, `Path=/`, and the SameSite setting below. Exact cookie name, domain scoping, and lifetime values are Stage 05 implementation decisions but must be documented there.
- The cookie carries no user data, no role claims, and no parseable payload — only an opaque reference. The server stores only a hashed form of the session identifier (ADR-002), so a database leak does not yield usable session tokens.
- No other cookie may carry authentication material. If a CSRF token uses a cookie-readable channel (see below), that token is not a credential and grants nothing without the session cookie.

### SameSite strategy

- Baseline: `SameSite=Lax` for the session cookie, which blocks cookie transmission on cross-site subresource requests while allowing top-level navigation.
- The frontend and API are deployed same-site or as an explicitly configured origin pair; cross-site embedding of the authenticated API is not supported.
- `SameSite` alone is treated as one defense layer, never the only CSRF defense (browser behavior varies; same-site subdomains and future deployment topologies can weaken it).

### CSRF defense (layered)

1. **SameSite cookie attribute** — primary ambient-credential mitigation.
2. **Session-bound CSRF token** — every state-changing request (`POST`/`PUT`/`PATCH`/`DELETE`) must present a CSRF token that the server validates against the authenticated session. The token is issued only to authenticated same-origin clients (e.g., via a same-origin endpoint or a JS-readable non-HttpOnly cookie); the specific delivery mechanism is selected in Stage 05 and must not expose the session credential itself.
3. **Origin/Referer validation** — state-changing requests must originate from the configured allowed origin(s); mismatch is rejected.
4. **CORS allow-list** — credentialed CORS is enabled only for explicitly configured frontend origins; wildcard origins with credentials are forbidden.

Safe-method requests (`GET`/`HEAD`/`OPTIONS`) must never perform state changes, so they are not CSRF-relevant.

### Session lifecycle

| Event | Required behavior |
|---|---|
| Registration | Creates a user account; a session is created only through successful authentication, never implicitly. |
| Login | Always issues a **new** session identifier (session fixation defense); the pre-authentication session context is discarded. Records creation time, client metadata sufficient for audit, and authentication strength. |
| Logout | Server-side invalidation of the session plus cookie clearing. Logout must not rely on cookie deletion alone. |
| Idle expiration | Sessions expire after a bounded idle period; sliding renewal is permitted up to an absolute maximum lifetime. Exact durations: Stage 05. |
| Absolute expiration | Sessions have a hard maximum lifetime regardless of activity; expiry invalidates server-side state. |
| Password change | Rotates the current session (new identifier) **and** invalidates all other sessions of that user. |
| Password reset completion | Invalidates **all** sessions of that user, including the requesting one; re-authentication is required. Reset credentials are single-use, short-lived, hashed at rest, and delivered out-of-band (provider per DP-08/Stage 11). |
| Role change / operator status change | Roles and OperatorProfile status are **never cached in the session**; authorization resolves them from the authoritative user/operator records on every request, so approvals, suspensions, and demotions take effect immediately. As defense-in-depth, privilege-elevating changes additionally rotate affected sessions. |
| Manual revocation (self) | A user can list and revoke their own active sessions; revocation is immediate server-side. |
| Manual revocation (admin) | An ADMIN can revoke any user's sessions; the action is audited. |
| Suspected compromise | Server-side invalidation of all sessions for the affected user(s) must be possible as an operational action. |

### Privileged-session handling

- Operations with elevated impact (admin administration, operator approval, refund actions, audit-log access) require an authenticated session whose full authentication is recent, within a bounded privileged-freshness window; otherwise step-up re-authentication is required. Exact window and step-up mechanism: Stage 05.
- Privileged actions are audited regardless of session age (03-user-roles.md principles).

### Session storage and validation

- The Session entity (02-domain-model.md) stores: hashed identifier, user reference, creation/last-use/expiry instants, rotation lineage, revocation metadata, and authentication-strength metadata.
- Every authenticated request resolves the session server-side; there is no self-contained/offline-validatable credential. Invalidated, expired, or unknown sessions yield unauthenticated handling.

## Rationale

Layered CSRF defense (SameSite + session-bound token + origin validation + CORS allow-list) avoids single-mechanism failure. Resolving role/status per request rather than embedding claims in sessions removes the stale-privilege class of bugs entirely and makes operator suspension immediate. Hashed session identifiers at rest and rotation on login follow established session-management guidance.

## Alternatives considered

- **JWT access tokens (any storage location)** — rejected: revocation requires deny-lists or short TTLs that reintroduce the old system's weaknesses; DP-02 resolved against client-held tokens.
- **SameSite=Strict as the sole defense** — rejected: breaks top-level navigation flows and still leaves same-site attack surfaces; kept only as a possible hardening for specific privileged endpoints (Stage 05 may evaluate).
- **Double-submit cookie without session binding** — rejected as sole mechanism: unbound tokens can be forged/injected in some topologies; if used, the token must be bound to the server-side session.
- **Trusting Origin/Referer alone** — rejected: headers can be absent or stripped in some client configurations; used only as an additional layer.

## Consequences

- The SPA must fetch/attach CSRF tokens for state-changing calls; the API client layer (03-api-conventions.md) owns this uniformly.
- Session storage is on the critical path of every authenticated request; capacity/index design is a Stage 03/05 concern.
- "Remember me"-style long-lived sessions, if ever desired, require a separate owner-approved design (not currently in scope).

## Security implications

- Session fixation, hijacking, and CSRF are addressed by explicit controls (threat model rows: session theft, CSRF).
- Revocation is real and immediate — no token remains valid after logout/password change/admin action.
- CSRF token endpoints must themselves be same-origin-protected and rate-limited.

## Testing implications

Stage 05 tests must cover: login rotation (fixation), logout invalidation (server-side, not just cookie), password change invalidates other sessions, reset invalidates all sessions, CSRF token missing/invalid/replayed-from-other-origin rejection, Origin/Referer mismatch rejection, idle/absolute expiry, self and admin revocation, and immediate effect of role/operator-status changes on authorization.

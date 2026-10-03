# ADR-002 — Session Authentication

- **Status:** Proposed — owner review required
- **Date:** 2026-10-03
- **Decision point:** DP-02 — owner resolved A

## Context
The old implementation used client-stored JWT state without server-side revocation. The new system requires server-managed sessions, httpOnly cookies, CSRF protection, rotation, expiration, and invalidation.

## Decision
Use opaque server-managed sessions:

1. Browser authenticates with credentials.
2. Server creates a random, high-entropy session secret/reference.
3. Browser stores it only in an httpOnly, Secure cookie.
4. Server stores a hashed session identifier/reference with user, expiration, creation, rotation, and revocation metadata.
5. Sensitive authentication events can rotate the session.
6. Logout/revocation invalidates the server-side session.
7. SameSite is configured deliberately per deployment.
8. State-changing browser requests use CSRF protection compatible with the cookie model.

No authentication token is stored in localStorage or sessionStorage.

## Security properties
- Session material is inaccessible to normal browser JavaScript.
- Server-side invalidation is possible.
- Session lifetime is explicit.
- CSRF is treated as a first-class threat because cookies are sent automatically.

## Consequences
This requires session persistence and CSRF-aware frontend/API behavior. It avoids treating a long-lived self-contained client token as the sole source of revocation state.

## Deferred implementation
Cookie attributes, session TTLs, password hashing parameters, CSRF mechanism, session-store schema, and rate-limit values are implementation decisions for Stages 04–05 and must be documented there. The architecture-level session lifecycle, rotation/revocation semantics, and layered CSRF strategy are defined in **ADR-010 (Session Lifecycle and CSRF Architecture)**, which expands this ADR.

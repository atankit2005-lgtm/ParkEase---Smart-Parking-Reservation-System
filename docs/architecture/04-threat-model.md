# 04 — Threat Model

## Status
Stage 01 baseline; implementation-specific findings remain for later security audits.

## Assets
- User credentials and sessions.
- Personal profile and vehicle data.
- Facility/operator data.
- Booking ownership and reservation state.
- Pricing and tax rules.
- Payment records and provider references.
- Refund state.
- Audit records.
- Recommendation inputs.

## Trust boundaries

```text
Browser
  │
  │ untrusted input / cookie / CSRF token
  ▼
HTTP API
  │
  ├── authorization policy (05-authorization-matrix.md)
  ├── application services
  └── validation
       │
       ▼
MongoDB (replica set — required for reservation transactions, ADR-003)

HTTP API ──→ external providers
            payment / maps / email / future AI

Payment provider ──→ webhook endpoint
                     (inbound boundary: signature-validated,
                      event-identity-deduplicated, amount/order-matched
                      before any state change — ADR-005/ADR-011)
```

## Primary threats and controls

| Threat | Required control |
|---|---|
| Session theft | Secure/httpOnly cookies, hashed session identifiers at rest, idle+absolute expiration, rotation on login/privileged events, immediate server-side revocation, secure transport (ADR-002, ADR-010) |
| Session fixation | New session identifier on every login; pre-auth context discarded (ADR-010) |
| CSRF | Layered defense: SameSite cookie + session-bound CSRF token + Origin/Referer validation + credentialed-CORS allow-list (ADR-010) |
| Broken object-level authorization | Central ownership/scope policy, facility-scope resolution from persisted references, matrix tests (ADR-007, 05-authorization-matrix.md) |
| Privilege escalation | Server-assigned roles, deny-by-default policy, roles/operator status resolved per request (never session-cached), admin capability decomposition (ADR-010, 05-authorization-matrix.md) |
| Unapproved-operator access | `OPERATOR` role without OperatorProfile `APPROVED` grants no operator scope; status changes are ADMIN-only and take immediate effect (DP-03, 02-domain-model.md) |
| Mass assignment | Boundary schemas and allow-listed fields; server-authoritative fields (price/status/owner/role) never bindable from input |
| Booking race (double booking) | Slot-document serialization gate + transaction-scoped overlap check + bounded retries; conditional transitions for expiry/confirmation/cancellation (ADR-003) |
| Contention amplification (DoS via retry storms) | Bounded transaction retries and rate limiting on booking/payment endpoints (ADR-003, Stage 04 rate limiting) |
| Price tampering | Server-side pricing and persisted price snapshot; provider-order amount matching (ADR-005, ADR-011) |
| Fake payment success | Server-side provider verification only; webhook signature validation; client callbacks are hints, never truth (ADR-005, ADR-011) |
| Webhook replay/duplication/out-of-order delivery | Event-identity idempotency, conditional `VERIFIED` transition, dual-channel convergence (ADR-011, 03-api-conventions.md) |
| Booking/payment state divergence (paid-but-expired, verified-but-unconfirmed) | Invariants I1–I4, reconciliation worker, mandatory refund path for verified payment on expired booking (ADR-011) |
| Duplicate refund | Refund execution bound to triggering event, idempotent, conditional (ADR-011) |
| Query injection | Allow-listed filters/sorts and typed query construction |
| Sensitive-data leakage | DTO shaping per field-visibility matrix (including operator PII limits), generic errors, log redaction |
| CORS abuse | Environment-specific allow-list; no wildcard with credentials |
| Abuse/credential attacks | Rate limiting and generic authentication responses |
| Audit tampering | Append-only application behavior; audit-log access is ADMIN read-only and itself audited |
| AI authority escalation | AI kept advisory and outside transaction/authorization paths |

## Security review rule
Threat controls are design requirements, not evidence of implementation. Stages 04, 05, 09, 10, and 14 must provide executable verification.

## Known uncertainty
Exact dependencies, deployment controls, MongoDB topology sizing, rate-limit values, cookie naming/TTLs, CSRF token delivery mechanism, and provider security configuration are implementation decisions for Stages 02–05/09–10; the architecture-level strategy for each is fixed by the referenced ADRs.

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
  │ untrusted input / cookie
  ▼
HTTP API
  │
  ├── authorization policy
  ├── application services
  └── validation
       │
       ▼
MongoDB

HTTP API ──→ external providers
            payment / maps / email / future AI
```

## Primary threats and controls

| Threat | Required control |
|---|---|
| Session theft | Secure/httpOnly cookies, expiration, rotation, revocation, secure transport |
| CSRF | CSRF protection and deliberate SameSite policy |
| Broken object-level authorization | Central ownership/scope policy and matrix tests |
| Privilege escalation | Server-assigned roles and deny-by-default policy |
| Mass assignment | Boundary schemas and allow-listed fields |
| Booking race | Atomic conflict prevention + transaction/conditional-write strategy |
| Price tampering | Server-side pricing and persisted price snapshot |
| Fake payment success | Provider verification and webhook signature validation |
| Webhook replay/duplication | Idempotency and event identity tracking |
| Query injection | Allow-listed filters/sorts and typed query construction |
| Sensitive-data leakage | DTO shaping, generic errors, log redaction |
| CORS abuse | Environment-specific allow-list |
| Abuse/credential attacks | Rate limiting and generic authentication responses |
| Audit tampering | Append-only application behavior |
| AI authority escalation | AI kept advisory and outside transaction/authorization paths |

## Security review rule
Threat controls are design requirements, not evidence of implementation. Stages 04, 05, 09, 10, and 14 must provide executable verification.

## Known uncertainty
Exact dependencies, deployment controls, MongoDB topology, rate-limit values, cookie attributes, and provider security configuration are not selected by this document.

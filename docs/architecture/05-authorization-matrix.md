# 05 — Authorization Matrix (Architecture Level)

## Status
Proposed for Stage 01 owner review.

## Purpose
This document defines the architecture-level authorization model and is the source of truth for later endpoint implementation. It does **not** enumerate the future route inventory; it defines the policy framework, the principal model, and representative resource/action combinations. It expands ADR-007 and the Stage 00 permission matrix (`../project-definition/03-user-roles.md`) without contradicting them.

## Principal model

| Principal | Definition |
|---|---|
| Visitor | Unauthenticated request. Public discovery, plus registration/login entry points (03-user-roles.md); no authenticated capability. |
| USER | Authenticated user without operator approval. Personal resources only. |
| OPERATOR (REQUESTED / REJECTED / SUSPENDED) | Has the `OPERATOR` role but **no approved operator status**. Treated as USER for all operator-scoped capabilities; role alone grants nothing. |
| OPERATOR (APPROVED) | `OPERATOR` role **and** OperatorProfile status `APPROVED` (02-domain-model.md). Facility-scoped capabilities on owned facilities only. |
| ADMIN | Platform administration, decomposed into the capabilities below; subject to audit. |

Role and operator status are resolved from authoritative server-side records on every request — never from client input, never cached in the session (ADR-010).

## Policy declaration framework

Every protected endpoint declares a policy answering all six dimensions. Missing any required dimension, or missing ownership/scope evidence, results in denial (deny-by-default).

```text
1. Authentication requirement     — none / session required / privileged-fresh session (ADR-010)
2. Allowed principal(s)           — which principals above may call it
3. Ownership requirement          — resource must belong to the authenticated principal
4. Facility scope                 — for OPERATOR: resource must resolve to a facility owned by the operator
5. Field-level visibility         — response DTO fields permitted for this principal (minimum PII)
6. Audit requirement              — whether the action emits an audit record
```

Personal-collection endpoints prefer authenticated context over client-chosen identifiers (e.g., `GET /api/v1/bookings/me`, not `GET /api/v1/bookings?userId=...`). A client-supplied user identifier is never an authority claim.

## Representative resource/action matrix

Legend: ✔ allowed · ✖ denied · O own resources only · S scoped to owned facilities · A audited

| Resource | Action | Visitor | USER | OPERATOR (APPROVED) | ADMIN | Ownership / scope rule | Sensitive-field rule | Audit |
|---|---|---|---|---|---|---|---|---|
| Facility / Zone / Slot | Read (discovery, availability, exact price) | ✔ (DP-05) | ✔ | ✔ | ✔ | Public data only; owner identity not exposed publicly | None beyond public | No |
| Facility / Zone / Slot / Hours / PricingRule | Create / update / deactivate | ✖ | ✖ | S | A | OPERATOR: `Facility.ownerUserId == principal`; Zone/Slot must resolve to an owned facility | Admin views exclude credentials/secrets | A for admin; operator config changes A |
| Facility | Delete / destructive reconfiguration | ✖ | ✖ | ✖ | A | Confirmed bookings protected (DP-09); emergency path = operator-cancellation workflow | — | A |
| Booking | Create (self) | ✖ | ✔ | ✔ (as driver, self) | ✔ (self) | `userId` from session; vehicle/slot reference integrity per 02-domain-model.md invariants 2–3, 12 | Client never sets price/status/owner | No (booking record is the audit trail) |
| Booking | Read own | ✖ | O | O (as driver) | O (as driver) | `Booking.userId == principal` | Full detail for owner | No |
| Booking | Read facility bookings (operational) | ✖ | ✖ | S | A (all) | OPERATOR: booking's facility owned by principal | **Operator PII set — see below** | A for admin bulk access |
| Booking | Cancel | ✖ | O (policy DP-13) | O own; S emergency workflow (DP-09) | A | Reason mandatory for operator-initiated; notification + refund evaluation triggered | — | A (operator/admin) |
| Payment | Initiate / view own | ✖ | O | O (own as driver) | A (all) | Payment bound to a booking owned by principal | Provider internals never exposed | A (admin) |
| Refund | Evaluate / execute | ✖ | ✖ | ✖ (operators do not execute refunds) | A | Server + provider reconciliation only (ADR-011) | No raw provider secrets | A |
| Review | Create (eligible booking) | ✖ | O | ✖ for own facilities (conflict of interest) | ✖ authoring | Eligibility tied to a completed booking owned by principal | — | No |
| Review | Moderate | ✖ | ✖ | ✖ | A | Platform-level | — | A |
| User account | Manage own profile / vehicles / preferences | ✖ | O | O | O | Owner only | Password hashes never exposed | No |
| User account | Manage others / change roles | ✖ | ✖ | ✖ | A | Admin only; self role-elevation impossible | Never readable: password hashes, provider secrets | A |
| OperatorProfile | Request operator status | ✖ | ✔ (self) | — | — | Self-service request creates status `REQUESTED` | — | A |
| OperatorProfile | Approve / reject / suspend / reinstate | ✖ | ✖ | ✖ | A | Admin only (DP-03) | — | A |
| Session | List / revoke own | ✖ | O | O | O | ADR-010 | Session material never returned | No |
| Session | Revoke others | ✖ | ✖ | ✖ | A | ADR-010 | — | A |
| AuditLog | Read | ✖ | ✖ | ✖ | A (read-only) | Nobody can edit/delete via the application | No secrets/PII in records by construction | A (access itself) |
| Platform configuration | Read / change | ✖ | ✖ | ✖ | A | Admin only | Secrets never returned | A |
| Notifications | Read own | ✖ | O | O | O | Owner only | Server-generated content | No |
| AI recommendation | Consume | ✔ where public | ✔ | ✔ | ✔ | Advisory only; never an authority for availability/price/access (FR-AI-02) | Personalization inputs per Stage 12 privacy decisions (DP-10) | No |

## ADMIN capability decomposition

"Admin can do everything" is not an architecture. ADMIN authority is decomposed into capabilities, each independently policy-declarable and audited:

```text
user management          — account oversight, role changes, session revocation
operator approval        — OperatorProfile lifecycle (DP-03)
facility administration  — oversight/intervention on any facility, subject to DP-09 protections
booking oversight        — read/intervene on bookings platform-wide
payment oversight        — read payment state, initiate refunds via reconciliation rules
review moderation        — hide/remove policy-violating reviews
audit-log access         — read-only
platform configuration   — application-level settings
```

Admin capabilities never include: forging payment outcomes, altering historical prices of completed bookings, altering or deleting audit records, or reading password hashes/provider secrets (03-user-roles.md boundaries).

## Operator-visible booking PII (OD-01 — finalized under DP-11 authority)

DP-11 resolved the principle (minimum necessary PII) and explicitly delegated the exact field-level visibility to the Stage 01 authorization ADR. This matrix finalizes it.

An OPERATOR (APPROVED), for bookings at facilities they own, may see **only**:

| Field | Justification |
|---|---|
| Booking reference | Operational identification and support |
| Vehicle identifier (registration/plate, vehicle type) | Physical parking operations (locating/validating the parked vehicle) |
| Booking window (start/end, facility-local + UTC) and status | Slot/occupancy operations |
| Slot / zone / facility identifiers | Already operator-owned data |
| User display name and the user's **registered contact email** | Exception workflows only (e.g., vehicle must be moved); shown in operational booking views, never in aggregate/occupancy/revenue views. Email is the single grounded contact channel in the User model; adding any other channel (e.g., phone) requires a new owner decision. |

Explicitly **not** visible to operators: full user profile, other bookings by the same user (at other facilities or historical beyond operational need), payment instrument or provider details, credentials, session data, favorites/preferences, review authorship beyond moderation-free contexts.

Contact-channel exposure is limited to active or upcoming bookings where an operational need exists; Stage 07/13 implementations must enforce this via response DTOs and are testable against this table. Any future expansion of this set requires a new owner decision.

## Enforcement architecture

- One shared policy layer (ADR-007) evaluates the six dimensions; routes/controllers cannot invent their own role checks.
- Ownership and facility scope are evaluated from persisted references (02-domain-model.md ownership chain), never from request payloads.
- Field visibility is enforced at response shaping (DTO serializers), not by client trust.
- Deny-by-default: an endpoint without a complete declared policy is unreachable.

## Testing requirements (architecture level)

Every protected route implements tests for the four Stage 00 classes — unauthenticated, wrong role, right role/wrong owner, right role/right owner — plus: OPERATOR-without-APPROVED-status denial, operator field-visibility DTO tests against the PII table above, admin capability boundary tests (cannot forge payments/audit), and deny-by-default verification for undeclared routes.

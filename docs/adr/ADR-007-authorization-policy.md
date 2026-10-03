# ADR-007 — Authorization and Minimum-PII Policy

- Status: Proposed — owner review required
- Date: 2026-10-03
- Decision point: DP-11

## Decision
Authorization is centralized in a shared policy layer and combines authentication, role, resource ownership, and operator facility scope.

### USER
May access only resources owned by the authenticated user unless a requirement explicitly grants public access.

### OPERATOR
May access operational data only for facilities whose stored owner is the authenticated operator, **and only while the operator's OperatorProfile status is `APPROVED`** (02-domain-model.md, DP-03). The `OPERATOR` role alone — with status `REQUESTED`, `REJECTED`, or `SUSPENDED` — grants no operator-scoped access; such accounts are treated as USER for authorization purposes.

Operator access to user data is limited to the minimum information required to operate a booking at an owned facility.

**Finalized (OD-01, under the field-level authority delegated by DP-11):** the operator-visible booking PII set is booking reference, vehicle identifier (registration/type), booking window and status, slot/zone/facility identifiers, and user display name plus the user's registered contact email shown only in operational booking views for active or upcoming bookings where an exception workflow need exists (any additional contact channel requires a new owner decision). The complete field table, explicit exclusions, and DTO enforcement rules are normative in `../architecture/05-authorization-matrix.md`. Any expansion requires a new owner decision.

### ADMIN
May perform platform administration and read broader operational data, subject to audit requirements. Admin authority is decomposed into individually declared, audited capabilities (user management, operator approval, facility administration, booking oversight, payment oversight, review moderation, audit-log access, platform configuration — see `../architecture/05-authorization-matrix.md`). Admin access does not make historical payment outcomes or audit records forgeable.

## Policy shape
Every resource policy answers the six dimensions of `../architecture/05-authorization-matrix.md`: authentication requirement, permitted principal(s) (role and operator approval status), ownership requirement, facility scope, field-level visibility, and audit requirement.

## Deny by default
Missing policy declarations or missing ownership/scope evidence result in denial.

## Consequences
Routes remain thin and cannot independently invent role checks. Authorization tests must cover unauthenticated, wrong-role, right-role/wrong-owner, and right-role/right-owner cases.

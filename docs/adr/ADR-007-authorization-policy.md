# ADR-007 — Authorization and Minimum-PII Policy

- Status: Proposed — owner review required
- Date: 2026-10-03
- Decision point: DP-11

## Decision
Authorization is centralized in a shared policy layer and combines authentication, role, resource ownership, and operator facility scope.

### USER
May access only resources owned by the authenticated user unless a requirement explicitly grants public access.

### OPERATOR
May access operational data only for facilities whose stored owner is the authenticated operator. Operator access to user data is limited to the minimum information required to operate a booking at an owned facility.

Proposed minimum booking-facing operator identity fields are booking reference, vehicle identifier required for parking operations, booking time/status, and the minimum user contact field required for an operational notification or exception workflow. The exact field-level DTO is finalized before Stage 07 implementation.

### ADMIN
May perform platform administration and read broader operational data, subject to audit requirements. Admin access does not make historical payment outcomes or audit records forgeable.

## Policy shape
Every resource policy answers: authentication, permitted role, ownership/scope, field visibility, and audit requirement.

## Deny by default
Missing policy declarations or missing ownership/scope evidence result in denial.

## Consequences
Routes remain thin and cannot independently invent role checks. Authorization tests must cover unauthenticated, wrong-role, right-role/wrong-owner, and right-role/right-owner cases.

# 03 — User Roles & Permissions

Initial roles: **USER**, **OPERATOR**, **ADMIN**. No other roles exist unless a real requirement is approved by the project owner (candidates such as SUPER_ADMIN or SUPPORT_AGENT are explicitly not introduced). Visitors are unauthenticated and are not a role.

## Principles
- Role is assigned and changed only server-side by an authorized actor; never from client input.
- Authorization = role check **and** ownership/scope check. A role alone never grants access to another principal's private data.
- Privileged actions are audited.
- Authorization rules live in one shared policy layer, not duplicated per route.

## Permission matrix
Legend: ✔ allowed · O own resources only · S scoped to owned facilities · ✖ forbidden · A allowed and audited

| Capability | Visitor | USER | OPERATOR | ADMIN |
|---|---|---|---|---|
| Browse/search facilities, view availability & price | ✔ (DP-05) | ✔ | ✔ | ✔ |
| Register / log in | ✔ | — | — | — |
| Manage own profile, preferences, favorites | ✖ | O | O | O |
| Manage own vehicles | ✖ | O | O | O |
| Create booking | ✖ | ✔ (for self) | ✔ (for self, as a driver) | ✔ (for self) |
| View booking | ✖ | O | O (own) + S (facility bookings) | A (all) |
| Cancel booking | ✖ | O (policy) | O own; S where policy allows operator cancellation (DP-09) | A |
| Initiate payment / view payments | ✖ | O | O own; S revenue summaries | A (all) |
| Create/edit review | ✖ | O (eligible bookings) | ✖ for own facilities (conflict of interest) | ✖ authoring; moderation A |
| Create/manage facilities, zones, slots, hours, pricing | ✖ | ✖ | S | A |
| View occupancy & revenue | ✖ | ✖ | S | A (platform-wide) |
| Manage users / change roles / approve operators | ✖ | ✖ | ✖ | A |
| Moderate reviews | ✖ | ✖ | ✖ | A |
| View audit logs | ✖ | ✖ | ✖ | A (read-only) |
| Platform configuration | ✖ | ✖ | ✖ | A |
| Edit/delete audit logs | ✖ | ✖ | ✖ | ✖ (nobody via application) |

## Boundaries and prohibitions
- USER: cannot see other users' bookings, vehicles, payments, or profiles; cannot set price, owner, status, or role.
- OPERATOR: scope = facilities where `owner == operator`. Cannot view platform-wide data, other operators' facilities, or user PII beyond what is required to serve a booking at their facility (minimum necessary: DP-11).
- ADMIN: can see but not forge payment outcomes; cannot alter historical prices of completed bookings, cannot alter audit logs, cannot read password hashes or provider secrets. Admin accounts are created/promoted only through a controlled server-side process (DP-03).
- Operator onboarding requires approval by an ADMIN (proposed; DP-03).

## Authorization test requirement
Every protected route has tests for: unauthenticated, wrong role, right role wrong owner, right role right owner.

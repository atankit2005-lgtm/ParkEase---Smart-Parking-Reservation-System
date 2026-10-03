# 04 — Feature Scope

Features map to requirement IDs in `02-requirements.md` and to implementing stages in `14-project-roadmap.md`. Anything not listed is out of scope until the project owner approves it (see `08-ai-agent-governance.md`, Rule 3).

| Area | Features | Requirements | Stage |
|---|---|---|---|
| Authentication | Register, login, logout, session/token handling, password change/reset, account security, authorization | FR-AUTH-*, SEC-* | 05 |
| User management | Profile, account info, vehicles, preferences, favorites | FR-USR-* | 06 |
| Parking management (operator) | Facilities, zones, slots, operating hours, pricing rules | FR-OPR-01 | 07 |
| Discovery | Search, filter, sort, location-based discovery, details, availability, pricing | FR-DISC-* | 08 |
| Booking | Create, details, history, cancel, status management, conflict prevention, pending-hold expiry | FR-BKG-* | 09 |
| Payments | Initiate, verify, success/failure, refunds, history | FR-PAY-* | 10 |
| Notifications | In-app; email (DP-08) | FR-NOT-* | 11 |
| Reviews | Create, manage, moderate, rating integrity | FR-REV-* | 11 |
| AI | Recommendations, personalized ranking, contextual suggestions, demand/occupancy insights | FR-AI-* | 12 |
| Operator dashboard | Occupancy, bookings, revenue, operational view | FR-OPR-02 | 13 |
| Admin dashboard | Users, operators, facilities, bookings, payments, reviews, audit logs, analytics, configuration | FR-ADM-* | 13 |

## Cross-cutting capabilities
Audit logging (FR-ADM-03; foundations in Stage 04, used from Stage 05), structured logging, health checks, rate limiting, validation, error handling (Stage 04).

## Explicit scope limits
- AI features are advisory (FR-AI-02). Deterministic logic owns availability, price, booking, payment.
- Notification channels beyond in-app and email require justification.
- Domain entities (User, Vehicle, ParkingLot, ParkingZone, ParkingSlot, Booking, Payment, Refund, Review, Notification, Favorite, AuditLog, OperatingHours, PricingRule, RecommendationProfile) are candidates. `Role` is an attribute of User; `ParkingOperator` may be a User role plus an ownership relation rather than a separate collection. Final model is a Stage 01/03 decision.

## Open scope questions
Whether slot-level selection is mandatory or zone-capacity booking suffices for some facilities (DP-06); recurring/monthly passes and dynamic pricing are not in scope unless approved.

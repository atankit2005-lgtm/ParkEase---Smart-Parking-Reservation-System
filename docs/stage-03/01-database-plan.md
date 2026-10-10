# ParkEase 2.0 - Stage 03 Database Design Plan



**Project:** ParkEase 2.0 - Smart Parking Reservation System

**Stage:** 03 - Database Design

**Branch:** `stage/03-database`

**Baseline Commit:** `ef833bdd8e7ceb394f64d5f55e8245442fd12104`

**Status:** PLAN - IMPLEMENTATION NOT STARTED



---



## 1. Stage Gate Status



Stage 03 begins from the freshly verified `main` branch after successful completion and merge of Stage 02.



### Preconditions



* [x] Stage 00 Requirements completed.

* [x] Stage 01 Architecture completed and merged.

* [x] Stage 02 Infrastructure completed and merged.

* [x] `main` synchronized with `origin/main`.

* [x] Working tree clean before branch creation.

* [x] Stage 03 branch created from verified `main`.

* [x] Stage 02 merge commit is the Stage 03 baseline.

* [ ] Stage 03 database plan approved.

* [ ] Stage 03 implementation completed.

* [ ] Stage 03 tests completed.

* [ ] Stage 03 audit completed.

* [ ] Stage 03 fixes completed.

* [ ] Stage 03 verification repeated.

* [ ] Stage 03 documentation completed.

* [ ] Stage 03 committed and pushed.

* [ ] Stage 03 PR reviewed and merged.

* [ ] Stage 03 gate passed.



**Important:** Creating the branch does not authorize implementation.



---



# 2. Purpose



Stage 03 establishes the persistence architecture and database implementation foundation for ParkEase 2.0.



The stage will define and implement:



* MongoDB collections and persistence models.

* Mongoose schemas.

* Schema-level validation.

* Database integrity constraints.

* Relationships and references.

* Identifier strategy.

* Timestamp persistence.

* Facility timezone persistence.

* Required indexes.

* Booking concurrency persistence prerequisites.

* Transaction capability.

* Migration/index evolution mechanism.

* Controlled seed/bootstrap separation.

* Database test factories and fixtures.

* Persistence-layer security/privacy safeguards.

* Database documentation.



The stage must provide a reliable persistence foundation for later application stages without implementing those later business workflows prematurely.



---



# 3. Governing Documents



The following documents remain authoritative:



### Project definition



* `docs/project-definition/01-...` through `14-...`

* `docs/project-definition/07-technical-constraints.md`

* `docs/project-definition/10-definition-of-done.md`

* `docs/project-definition/11-git-strategy.md`

* `docs/project-definition/12-testing-strategy.md`

* `docs/project-definition/14-project-roadmap.md`



### Architecture



* `docs/adr/ADR-001-monorepo-and-typescript.md`

* `docs/adr/ADR-002-session-authentication.md`

* `docs/adr/ADR-003-booking-concurrency.md`

* `docs/adr/ADR-004-time-zones.md`

* `docs/adr/ADR-005-payment-authority.md`

* `docs/adr/ADR-006-pending-holds.md`

* `docs/adr/ADR-007-authorization-policy.md`

* `docs/adr/ADR-008-stage-01-technology-decisions.md`

* `docs/adr/ADR-010-session-lifecycle-and-csrf.md`

* `docs/adr/ADR-011-booking-payment-state-consistency.md`



### Previous-stage infrastructure



* `docs/stage-02/01-infrastructure-plan.md`

* `docs/stage-02/02-local-development.md`



No Stage 01 architecture decision may be silently redesigned during Stage 03.



---



# 4. Stage 03 Scope



## 4.1 In scope



### Database infrastructure integration



* MongoDB connection configuration.

* Mongoose integration.

* Environment-aware database configuration.

* Connection lifecycle handling.

* Local replica-set compatibility.

* Transaction capability verification.



### Domain persistence



Implement persistence models for the approved domain entities:



* `User`

* `OperatorProfile`

* `Session`

* `Vehicle`

* `Facility`

* `Zone`

* `ParkingSlot`

* `PricingRule`

* `Booking`

* `Payment`

* `Refund`

* `Review`

* `Notification`

* `AuditLog`



### Schema design



* Field definitions.

* Required fields.

* Optional fields.

* Enum/state restrictions.

* Type restrictions.

* String/number/date boundaries.

* Nested value objects where appropriate.

* References.

* Historical snapshots.

* Persistence metadata.



### Integrity



Where MongoDB/Mongoose can enforce an invariant safely, the persistence layer must enforce it.



### Indexing



Design and implement query-driven indexes with explicit justification.



### Concurrency prerequisites



Persist the architecture-required:



```text

ParkingSlot.reservationVersion

```



and ensure it is suitable for the Stage 09 booking transaction design.



### Migration/index evolution



Establish a deterministic and reproducible migration mechanism.



### Seed/bootstrap separation



Keep the following mechanisms distinct:



1. Development seed.

2. Secure initial ADMIN deployment bootstrap.

3. Test factories/fixtures.



### Testing



* Schema tests.

* Constraint tests.

* Index tests where meaningful.

* Validation tests.

* Reference/integrity tests.

* Timestamp/timezone persistence tests.

* Transaction capability tests.

* Concurrency prerequisite tests.

* Seed/migration idempotency tests where applicable.

* Security/privacy persistence tests.



### Documentation



Document:



* Collections.

* Relationships.

* Important indexes.

* Invariants.

* Migration strategy.

* Seed strategy.

* Local database operation.

* Transaction prerequisites.

* Known limitations and deferred decisions.



---



# 5. Explicit Non-Scope



The following must NOT be implemented in Stage 03:



* Login.

* Registration.

* Password authentication.

* Authentication workflow.

* Session authentication workflow.

* CSRF middleware.

* Authorization middleware.

* User APIs.

* Vehicle APIs.

* Facility management APIs.

* Parking management APIs.

* Search.

* Maps.

* Availability service.

* Booking creation service.

* Booking cancellation workflow.

* Booking state-machine service.

* Pricing engine.

* Payment provider integration.

* Razorpay integration.

* Refund processing.

* Notifications.

* Recommendation engine.

* Frontend/UI.

* Dashboards.

* Deployment infrastructure.

* Production hosting.

* Performance optimization beyond database correctness/index planning.

* Stage 09 pending-payment hold duration.

* Stage 09 cancellation/refund policy.



A `Booking` persistence schema is in scope.



A `Booking` application/service workflow is not.



---



# 6. Persistence Domain Inventory



The database layer must represent the following domain:



```text

User

 ├── Vehicles

 ├── Bookings

 └── Sessions



User / Operator

 └── Facilities

      └── Zones

           └── ParkingSlots



Facility

 ├── PricingRules

 └── Bookings



ParkingSlot

 └── Bookings



Booking

 ├── Payment

 ├── Review

 └── lifecycle

```



Operator lifecycle must distinguish:



* ordinary user identity,

* operator role/scope,

* operator approval state.



Therefore `OperatorProfile` is treated as a persistence concern rather than implicitly encoded only through `User`.



---



# 7. Collection and Model Architecture



The target persistence architecture is:



```text

MongoDB

   │

   └── Mongoose

         ├── User

         ├── OperatorProfile

         ├── Session

         ├── Vehicle

         ├── Facility

         ├── Zone

         ├── ParkingSlot

         ├── PricingRule

         ├── Booking

         ├── Payment

         ├── Refund

         ├── Review

         ├── Notification

         └── AuditLog

```



Each independently managed business entity should have its own collection unless there is a documented reason to embed it.



---



# 8. Reference vs Embedding Strategy



The approved Stage 03 planning direction is:



## References



Use references for independently managed entities, especially:



* User → Vehicle.

* User → Booking.

* User → Session.

* Facility → Zone.

* Zone → ParkingSlot.

* Facility → PricingRule.

* Booking → User.

* Booking → Vehicle.

* Booking → Facility.

* Booking → ParkingSlot.

* Booking → Payment.

* Booking → Review.

* Payment → Refund.



References prevent large aggregate documents and allow independently evolving entities to remain separately managed.



## Embedding



Embedding may be used for small value-like structures that:



* belong entirely to the owning document,

* do not require independent lifecycle management,

* must remain historically stable with the parent,

* do not need independent querying.



Examples include appropriate historical snapshots and value objects.



Embedding must not be used merely to avoid defining relationships.



---



# 9. Identifier Strategy



The approved strategy is:



## Internal identity



Use MongoDB `ObjectId` identifiers for internal persistence relationships.



## External identity



Where an entity is exposed outside the persistence layer, use an opaque public reference rather than exposing internal database identifiers unnecessarily.



Public references must not reveal sensitive information or encode business meaning.



The application layer remains responsible for mapping public references to internal persistence identifiers.



---



# 10. Lifecycle and Deletion Policy



Historical/business entities must not be destructively deleted when deletion would damage historical integrity.



Use explicit lifecycle/status fields where appropriate.



This is particularly important for:



* Facilities.

* Zones.

* Parking slots.

* Bookings.

* Payments.

* Refunds.

* Reviews.

* Audit records.



Destructive deletion must be limited to entities where retention is explicitly unnecessary and must never be used to circumvent business-history requirements.



`AuditLog` must be treated as append-only.



---



# 11. Timestamp and Timezone Persistence



The persistence layer must follow ADR-004.



## Timestamp rule



Persist machine timestamps as UTC instants.



Use MongoDB/Mongoose date types rather than formatted local-time strings for actual instants.



Typical lifecycle fields may include:



* `createdAt`

* `updatedAt`

* domain-specific timestamps where required.



## Facility timezone



A facility must persist its authoritative IANA timezone identifier.



Example:



```text

Asia/Kolkata

```



The timezone is a facility property, not a property inferred from the server environment.



## Important boundary



Stage 03 persists the timezone and timestamp model.



Stage 03 does not implement the complete booking-local-time interpretation workflow.



DST behavior required by ADR-004 must have appropriate persistence/domain test fixtures where relevant, while the full booking-time policy remains in its later owning stage.



---



# 12. Schema Validation



Validation must exist at multiple layers:



```text

API/runtime validation

        ↓

application/domain validation

        ↓

Mongoose schema validation

        ↓

MongoDB constraints/indexes

```



Stage 03 establishes the persistence-level portion of this boundary.



Mongoose schemas must validate at minimum:



* required fields,

* allowed types,

* enum values,

* string constraints,

* numeric constraints,

* date constraints,

* nested structures,

* reference formats,

* state fields,

* immutable historical fields where appropriate.



Database validation is not a replacement for future application/business validation.



---



# 13. Database Integrity Invariants



The persistence model must support the following invariants.



## 13.1 Physical-slot booking



Bookings reference a physical `ParkingSlot`.



No booking may represent only a zone-capacity reservation.



Required hierarchy:



```text

Facility

   ↓

Zone

   ↓

ParkingSlot

   ↓

Booking

```



## 13.2 Ownership



The schema relationships must allow later application layers to establish:



* booking ownership,

* vehicle ownership,

* facility/operator scope.



Stage 03 must not implement the authorization policy itself.



## 13.3 Facility hierarchy



The persistence structure must preserve:



```text

Facility → Zone → ParkingSlot

```



and prevent ambiguous ownership relationships.



## 13.4 Historical pricing



Booking persistence must support server-generated historical price information.



A later pricing change must not rewrite the price historically associated with an existing booking.



## 13.5 Payment consistency



The persistence model must support the booking/payment state rules from ADR-005 and ADR-011.



In particular:



```text

₹0 booking

    ↓

payment state = NOT_REQUIRED

```



The database model must not require an external payment transaction for a zero-value booking.



The actual same-transaction booking confirmation workflow belongs to the later booking/payment stages.



## 13.6 Time integrity



Persist actual instants in UTC.



Facility local business interpretation uses the stored IANA timezone.



## 13.7 Booking overlap



The database model must support the later enforcement of:



```text

A.start < B.end

AND

B.start < A.end

```



Stage 03 must not pretend that an ordinary MongoDB unique index can directly enforce arbitrary temporal overlap.



Overlap enforcement belongs to the Stage 09 transaction/service design.



## 13.8 Reservation version



`ParkingSlot.reservationVersion` must exist as the persistence serialization gate defined by ADR-003.



It must be suitable for atomic transactional increment/update operations.



---



# 14. Index Strategy



Indexes must be query-driven.



Do not create indexes solely because a field exists.



Every non-trivial index should have a documented purpose based on an expected access pattern.



Index planning must consider:



* public facility discovery,

* facility → zone traversal,

* zone → slot traversal,

* booking lookup by user,

* booking lookup by vehicle,

* booking lookup by facility,

* booking lookup by slot,

* booking lifecycle/state queries,

* payment lookup,

* session lookup,

* operator/facility scope queries,

* notification retrieval,

* audit retrieval,

* uniqueness constraints.



Indexes must be reviewed for:



* correctness,

* selectivity,

* uniqueness requirements,

* partial-index suitability,

* compound ordering,

* write overhead,

* interaction with lifecycle/state fields.



The Stage 03 audit must explicitly verify that important indexes correspond to actual expected queries.



---



# 15. Booking Concurrency Persistence Prerequisites



ADR-003 establishes the booking concurrency architecture.



Stage 03 must provide its persistence prerequisites without implementing the booking service.



The critical mechanism is:



```text

ParkingSlot.reservationVersion

```



The later transaction flow will use this field as a serialization/conflict mechanism.



Conceptually:



```text

Transaction A

    reads slot version N

    performs booking work

    increments reservationVersion

    commits



Transaction B

    reads same slot/version

    performs conflicting work

    attempts conflicting write

    transaction conflict/retry

```



Stage 03 must verify that MongoDB/Mongoose infrastructure can support the required transaction behavior.



The actual booking transaction, overlap query, retry policy, hold expiration, cancellation, and payment coordination remain outside this stage.



---



# 16. Transaction Capability



Stage 02 already established local MongoDB replica-set infrastructure.



Stage 03 must verify the persistence layer can:



* start a session,

* start a transaction,

* perform multiple document operations,

* commit,

* roll back,

* correctly observe rollback,

* handle transaction failures appropriately.



Tests must use the real local MongoDB replica-set environment rather than a fake transaction abstraction.



A passing transaction-capability test is a Stage 03 gate requirement.



---



# 17. Migration Strategy



Stage 03 must establish a versioned migration mechanism.



Migration requirements:



* deterministic,

* reproducible,

* idempotent where technically appropriate,

* ordered,

* reviewable,

* safe to rerun,

* compatible with CI/local development,

* documented.



Migration responsibilities include:



* collection/data evolution,

* index creation/evolution,

* data backfills when required,

* schema-transition support.



Migrations must not silently mutate production data without explicit, reviewable behavior.



---



# 18. Seed Strategy



Development seed data must be separate from production bootstrap.



## Development seed



Purpose:



* local development,

* repeatable manual testing,

* predictable sample data.



It must be safe to rerun according to its documented behavior.



## Deployment ADMIN bootstrap



The initial ADMIN mechanism must follow DP-03.



It must be:



* secure,

* deployment-controlled,

* idempotent,

* non-destructive,

* separate from normal development seed data.



## Test factories



Tests must use deterministic factories/fixtures rather than depending on development seed data.



These three systems must not be conflated.



---



# 19. Repository / Data-Access Boundary



Database access should have a clear boundary between:



```text

Application/domain logic

        ↓

Persistence/data-access layer

        ↓

Mongoose

        ↓

MongoDB

```



Stage 03 should avoid leaking raw persistence implementation throughout unrelated application code.



The persistence layer should provide predictable mechanisms for:



* model access,

* queries,

* transactions,

* persistence errors,

* mapping where required.



Business workflows remain in later stages.



---



# 20. Database Configuration



Database configuration must support:



* local development,

* automated tests,

* CI,

* future production configuration.



Configuration must come from environment/configuration mechanisms established by Stage 02.



No credentials or secrets may be committed.



The implementation must not hard-code:



* credentials,

* production connection strings,

* private hosts,

* authentication secrets.



Local MongoDB configuration must remain compatible with the Stage 02 replica-set setup.



---



# 21. Security and Privacy



The persistence layer must follow the project's minimum-necessary-PII principle.



Requirements include:



* Do not persist unnecessary personal data.

* Do not store raw card/payment credentials.

* Do not persist authentication secrets unnecessarily.

* Sensitive session material must follow ADR-002/ADR-010 requirements.

* Audit records must not accidentally expose secrets.

* Database error responses must not leak sensitive persistence details through later API layers.

* Schema strictness must prevent unexpected fields from becoming an uncontrolled persistence surface.



Unexpected-field behavior must be explicitly tested.



Injection-style payloads must be tested at the persistence boundary where relevant.



---



# 22. State Fields



Stateful entities must use explicit controlled states rather than relying on implicit absence/presence.



Examples include:



* user/operator lifecycle,

* facility lifecycle,

* parking slot lifecycle,

* booking lifecycle,

* payment lifecycle,

* refund lifecycle,

* notification lifecycle.



State values must be centrally defined and schema-restricted.



Stage 03 defines persistence representation.



State-transition business rules remain with their owning later stages.



---



# 23. Payment Persistence



The database must support ADR-005 and ADR-011 without implementing payment integration.



Payment persistence must be able to represent:



* internal payment identity,

* booking association,

* amount,

* currency,

* payment state,

* provider references where applicable,

* verification-related metadata where required,

* `NOT_REQUIRED` for ₹0 bookings,

* timestamps.



No card number, CVV, PIN, or equivalent raw card data may be stored.



Razorpay integration belongs to Stage 10.



---



# 24. Review and Notification Persistence



`Review` and `Notification` models may be established because they are part of the approved domain inventory.



However:



* review workflow belongs to Stage 11;

* notification generation/delivery belongs to Stage 11.



Stage 03 only establishes the persistence foundation required by later stages.



---



# 25. Audit Log Persistence



`AuditLog` must support the project's auditability requirements.



The model should provide enough structure to record relevant events without storing unnecessary sensitive data.



It must be designed as append-only from the application perspective.



Later authorization/business stages determine which actions generate audit events.



Stage 03 provides the persistence capability only.



---



# 26. Testing Strategy



Testing must follow the project testing strategy and include risk-focused database tests.



## 26.1 Schema tests



Verify:



* valid documents are accepted;

* required fields are enforced;

* invalid types fail;

* invalid enum values fail;

* invalid ranges fail;

* malformed references fail where appropriate;

* unexpected fields behave according to the chosen strictness policy.



## 26.2 Constraint tests



Verify important:



* uniqueness,

* required relationships,

* state restrictions,

* lifecycle restrictions,

* index-backed constraints.



## 26.3 Timestamp tests



Verify:



* UTC persistence,

* automatic timestamps where configured,

* domain timestamps remain machine instants,

* timezone identifiers remain explicit facility data.



## 26.4 Relationship tests



Verify:



* Facility → Zone.

* Zone → ParkingSlot.

* Booking → Facility.

* Booking → ParkingSlot.

* Booking → Vehicle.

* Booking → User.

* Payment → Booking.



## 26.5 Concurrency prerequisite tests



Verify `reservationVersion` can participate in the required transactional conflict mechanism.



Do not implement the complete booking race workflow in this stage.



## 26.6 Transaction tests



Verify:



* commit persists expected changes;

* rollback removes transactional changes;

* multi-document transaction behavior works;

* real replica-set transactions work.



## 26.7 Migration tests



Verify migrations:



* execute in correct order;

* can be reproduced;

* are safe to rerun where declared idempotent;

* create/evolve required indexes.



## 26.8 Seed tests



Verify development seed behavior and bootstrap behavior remain separate.



## 26.9 Security/privacy tests



Verify:



* secrets are not persisted accidentally;

* prohibited sensitive payment data is rejected/not modeled;

* unexpected fields are handled safely;

* injection-style persistence payloads do not bypass schema expectations.



---



# 27. CI and Local Database Compatibility



Stage 03 must remain compatible with the Stage 02 CI environment.



The database test suite must work with the existing MongoDB replica-set infrastructure.



Do not introduce a fake database implementation merely to make tests pass.



The preferred test environment is the real MongoDB setup already established in Stage 02.



The Stage 03 implementation must not break:



* formatting,

* linting,

* strict TypeScript compilation,

* existing tests,

* workspace builds,

* CI.



---



# 28. Documentation Requirements



Stage 03 must document:



1. Database architecture.

2. Collection/model inventory.

3. Entity relationships.

4. Identifier strategy.

5. Reference vs embedding decisions.

6. Timestamp/timezone persistence.

7. Important schema invariants.

8. Index strategy.

9. Booking concurrency prerequisites.

10. Transaction capability.

11. Migration process.

12. Seed process.

13. Bootstrap process.

14. Test factory strategy.

15. Local database usage.

16. Known limitations.

17. Explicitly deferred decisions.



Documentation must not claim that later business workflows are implemented merely because their persistence schemas exist.



---



# 29. Risks and Deferred Decisions



The following remain intentionally deferred to their owning stages.



### Stage 04–05



* Exact application database-access integration.

* Session/auth implementation.

* Authentication workflow.

* Authorization implementation.



### Stage 09



* Booking transaction workflow.

* Availability calculation.

* Exact pending-payment hold duration.

* Booking cancellation/refund policy.

* Full overlap/race handling.

* Booking state machine implementation.



### Stage 10



* Razorpay integration.

* Payment verification.

* Webhooks.

* Reconciliation.

* Refund execution.



### Stage 11



* Notification workflow.

* Email delivery.

* Review workflow.



### Stage 12



* Recommendation system.



### Stage 14



* Performance/security hardening beyond the Stage 03 persistence baseline.



No deferred decision may be silently resolved inside Stage 03.



---



# 30. Owner Decisions Already Approved for Stage 03



The following planning decisions have already been accepted for this stage:



### Identifier strategy



```text

ObjectId internally

+

opaque public references where externally exposed

```



### Relationship strategy



```text

References for independently managed entities

+

embedding only for small/value-like structures

```



### Historical deletion strategy



```text

Lifecycle/status

rather than destructive deletion

for historical/business entities

```



These decisions do not require another approval unless implementation uncovers a genuine contradiction with an authoritative architecture document.



---



# 31. ADR Status Discipline



Existing ADR statuses must not be changed merely to make Stage 03 appear more complete.



In particular:



* ADR-001 is accepted through its approved owner decision.

* ADR-004 is accepted through its approved owner decision.

* Other proposed ADRs remain proposed unless their owner review occurs through the established governance process.



Stage 03 implementation must respect their defined architectural direction without falsely changing their approval status.



---



# 32. Implementation Sequence



Once this plan is explicitly approved, implementation must proceed in controlled increments.



Recommended sequence:



### Step 1 - Persistence foundation



* Database configuration.

* Mongoose connection.

* Persistence module structure.

* Test database helpers.



### Step 2 - Shared persistence primitives



* Identifier utilities.

* timestamp conventions.

* schema/common configuration.

* controlled enum/state definitions.



### Step 3 - Core identity/domain models



* User.

* OperatorProfile.

* Session.

* Vehicle.



### Step 4 - Parking hierarchy



* Facility.

* Zone.

* ParkingSlot.



### Step 5 - Commercial/booking persistence



* PricingRule.

* Booking.

* Payment.

* Refund.



### Step 6 - Supporting domain persistence



* Review.

* Notification.

* AuditLog.



### Step 7 - Indexes and constraints



Implement and test the approved query-driven index strategy.



### Step 8 - Migrations



Implement versioned migration/index evolution.



### Step 9 - Seed/bootstrap separation



Implement controlled development seed and deployment bootstrap mechanisms.



### Step 10 - Database tests



Implement the complete Stage 03 persistence test suite.



### Step 11 - Documentation



Complete Stage 03 database documentation.



### Step 12 - Full verification



Run the required formatting, linting, type checking, database tests, transaction tests, existing regression suite, and CI-equivalent validation.



No later-stage business workflow should be introduced while performing these steps.



---



# 33. Stage 03 Definition of Done



Stage 03 is complete only when all applicable requirements below are satisfied.



## Architecture



* [ ] Persistence design follows Stage 00/01/02 requirements.

* [ ] No architectural decision was silently changed.

* [ ] No later-stage workflow was pulled forward.



## Database



* [ ] MongoDB/Mongoose integration works.

* [ ] All approved Stage 03 persistence entities are represented.

* [ ] Relationships are correct.

* [ ] Schema validation is implemented.

* [ ] Important database constraints are implemented.

* [ ] Required indexes are implemented and justified.

* [ ] UTC timestamp persistence is correct.

* [ ] Facility IANA timezone persistence is correct.

* [ ] `reservationVersion` exists and is transaction-compatible.

* [ ] Payment persistence supports `NOT_REQUIRED`.

* [ ] Audit persistence is append-oriented.



## Migrations and seed



* [ ] Migration strategy implemented.

* [ ] Migration behavior tested.

* [ ] Development seed separated from deployment bootstrap.

* [ ] Test factories are deterministic.



## Testing



* [ ] Schema tests pass.

* [ ] Constraint tests pass.

* [ ] Relationship tests pass.

* [ ] Timestamp/timezone tests pass.

* [ ] Transaction capability tests pass.

* [ ] Concurrency prerequisite tests pass.

* [ ] Migration tests pass.

* [ ] Seed/bootstrap tests pass where applicable.

* [ ] Security/privacy persistence tests pass.

* [ ] Existing regression suite passes.



## Quality



* [ ] Strict TypeScript passes.

* [ ] Lint passes.

* [ ] Formatting passes.

* [ ] Builds pass.

* [ ] CI passes.

* [ ] No critical/high unresolved defects.

* [ ] Documentation complete.



## Governance



* [ ] Independent audit completed.

* [ ] Audit findings fixed.

* [ ] Verification repeated after fixes.

* [ ] Working tree clean.

* [ ] Changes committed.

* [ ] Designated Stage 03 branch pushed.

* [ ] Pull request created.

* [ ] Required review completed.

* [ ] PR merged into `main`.

* [ ] Stage 03 gate formally passed.



---



# 34. Exit Gate



Stage 03 may advance to Stage 04 only after:



```text

PLAN

  ↓

IMPLEMENT

  ↓

TEST

  ↓

AUDIT

  ↓

FIX

  ↓

VERIFY AGAIN

  ↓

DOCUMENT

  ↓

COMMIT

  ↓

PUSH

  ↓

PR

  ↓

REVIEW

  ↓

MERGE

  ↓

STAGE 03 GATE

  ↓

STAGE 04

```



A passing implementation test alone is insufficient.



The stage must also pass architecture, invariant, security/privacy, index/query, transaction, documentation, and governance review.



---



# 35. Final Stage 03 Boundary



The most important boundary is:



> **Stage 03 establishes trustworthy persistence. It does not implement the application's business workflows.**



Therefore:



```text

Stage 03

    = database design + schemas + constraints + indexes

      + migrations + seeds + transaction capability

      + persistence tests + documentation



Stage 04+

    = application/database integration and business workflows

```



The existence of a schema must never be interpreted as implementation of the corresponding application feature.



---



## Plan Status



**PLAN COMPLETE - IMPLEMENTATION NOT STARTED**



Baseline:



```text

ef833bdd8e7ceb394f64d5f55e8245442fd12104

```



Branch:



```text

stage/03-database

```



Planned primary document:



```text

docs/stage-03/01-database-plan.md

```



**Approval required before implementation begins.**

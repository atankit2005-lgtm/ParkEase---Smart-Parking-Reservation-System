# 14 — Project Roadmap

Each stage: branch `stage/NN-...` from `main`; passes the gate in `10-definition-of-done.md` before merge. Every stage's audit also confirms no regression of earlier-stage gates. Testing expectations always include the classes in `12-testing-strategy.md` relevant to that stage.

| # | Stage | Objective | Major deliverables | Depends on | Testing | Audit | Completion criteria |
|---|---|---|---|---|---|---|---|
| 00 | Project Definition | Establish governing spec | docs/project-definition, AGENTS.md, CONTRIBUTING.md | — | Doc consistency review | Independent read-through | Gate checklist passes; owner approval |
| 01 | Architecture & Technology Design | Resolve DPs; design system | Architecture, domain model, ADRs (auth, payments, booking concurrency, hold/expiry, time zones, tech choices), API conventions, threat model | 00 | ADR review; model walk-through against workflows | Architecture + security review | All blocking DPs decided or deferred in writing |
| 02 | Repository & Dev Infrastructure | Reproducible dev/CI | Project scaffold, TS/lint/format, test runners, CI, Docker dev env, env/config handling, `.env.example`, branch protection | 01 | CI runs sample tests; clean-clone setup works | Secrets/dependency audit | Fresh clone builds and tests in CI |
| 03 | Database Design | Implement data model | Mongoose schemas, validation, indexes, seed/migration scripts, DB docs | 01, 02 | Schema/constraint tests; transaction capability test | Index/query and invariant review | Invariants enforced by DB where possible |
| 04 | Backend Foundation | Cross-cutting backend | App skeleton, config validation, error handling, logging, request IDs, health checks, rate limiting, security headers, CORS, audit-log foundation | 02, 03 | Middleware and health tests | Security baseline audit | Route-policy mechanism in place |
| 05 | Authentication & Authorization | Identity and access | Register/login/logout, password flows, token/session model, RBAC + ownership policy layer | 04 | Auth and authorization matrix, abuse tests | Dedicated security audit | RC-01..05, 10..12 covered by tests |
| 06 | User & Vehicle Management | Profile data | Profile, vehicles, preferences, favorites | 05 | Ownership and validation tests | Privacy review | Users access only own data |
| 07 | Parking Management | Operator inventory | Facilities, zones, slots, hours, pricing rules, operator scoping, admin approval flow | 05, 03 | Scope tests, pricing-rule tests | Authorization audit | Operators confined to owned facilities |
| 08 | Search, Discovery & Maps | Find parking | Search/filter/sort, geo queries, availability computation, maps integration | 07 | Query, geo, availability tests; perf checks | Query/index audit | Availability computed from real data |
| 09 | Booking Engine | Safe reservation | Booking state machine, atomic slot reservation, price calculation, hold expiry, cancellation, policy | 06, 07, 08 | Concurrency, state-machine, time/DST, idempotency tests | Dedicated integrity audit | SC-1; RC-01..03, 08, 09, 13 covered |
| 10 | Payments | Verified payments | Provider integration, payment state machine, webhooks, idempotency, refunds, reconciliation | 09 | Signature, duplicate/out-of-order, tamper, failure tests | Dedicated payment security audit | SC-3; RC-06, 07 covered |
| 11 | Reviews, Notifications & Supporting | Engagement | Reviews with eligibility, moderation hooks, in-app and email notifications | 09, 10 | Eligibility, rating integrity, notification tests | Privacy/content review | FR-REV, FR-NOT met |
| 12 | AI / Recommendations | Advisory ranking | Recommendation service, profile/signals, privacy controls, fallbacks | 08, 09, 11 | Determinism of fallback, bounds, privacy tests | AI/privacy audit | FR-AI-02 verified: no effect on transactions |
| 13 | Admin & Operator Dashboards | Operations UI/API | Operator and admin dashboards, analytics, audit log viewer, moderation | 07, 09, 10, 11 | Scoped-data tests, UI tests | Authorization/privacy audit | FR-OPR-02, FR-ADM-* met |
| 14 | Security, Performance & Quality Audit | Hardening | Full security audit, load tests, dependency audit, accessibility audit, fixes | 05–13 | Load, security, a11y suites | Independent audit | No open critical/high findings |
| 15 | Testing & Production Readiness | Release confidence | E2E suite, observability, backups, deployment config, runbooks | 14 | Full regression + E2E | Readiness review | Deployable, monitored, documented |
| 16 | Documentation & Portfolio | Presentation | README, architecture docs, API docs, demo, case-study write-up | 15 | Doc accuracy check against code | Docs audit | Docs match behavior |
| 17 | Final Release | Ship | Release candidate, tag, changelog | 16 | Final regression | Final gate | Owner sign-off |

Order is dependency-driven; changing it requires an ADR and owner approval. Items in later stages must not be started early (scope rule).

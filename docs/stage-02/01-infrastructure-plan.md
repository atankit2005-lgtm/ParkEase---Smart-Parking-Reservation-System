# Stage 02 — Infrastructure Plan

- **Stage:** 02 — Repository & Dev Infrastructure
- **Status:** IMPLEMENTATION IN PROGRESS — exit gate not validated
- **Branch:** `stage/02-infrastructure`
- **Baseline:** `a378ff8ec928ef1a2d910391c6fe18fbd25c09eb`
- **Baseline title:** `docs: merge Stage 01 architecture`
- **Roadmap source:** `docs/project-definition/14-project-roadmap.md`
- **Governing sources:** `docs/project-definition/`, `AGENTS.md`, `CONTRIBUTING.md`, Stage 01 architecture and ADRs
- **Plan document:** `docs/stage-02/01-infrastructure-plan.md`

## 1. Purpose

Stage 02 establishes the reproducible repository and development infrastructure required by later application stages. It does not implement ParkEase business capabilities.

The objective is:

> A clean checkout can install dependencies deterministically, type-check/lint/format/test the infrastructure scaffold, start the required local services, and execute the same validation path in CI.

Stage 02 follows the existing mandatory workflow:

`PLAN → IMPLEMENT → TEST → AUDIT → FIX → VERIFY → DOCUMENT → COMMIT → PUSH → STAGE GATE`

This document is the approved Stage 02 plan. Implementation is authorized and underway; this
status does not certify that the exit gate has passed.

## 2. Verified starting state

The following bullets are the historical snapshot taken while authoring this plan.
Current local verification is recorded in §25.

Remote repository verification performed during planning:

- Repository: `atankit2005-lgtm/ParkEase---Smart-Parking-Reservation-System`
- Default branch: `main`
- Remote branch `stage/02-infrastructure` exists.
- `stage/02-infrastructure` is identical to `a378ff8ec928ef1a2d910391c6fe18fbd25c09eb`.
- Comparison result: 0 commits ahead, 0 behind, 0 changed files.
- Therefore no remote Stage 02 implementation exists yet.

The local working-tree state, local HEAD, and local tracking configuration cannot be verified through the available GitHub interface. The developer must run local Git checks before implementation begins; no clean-tree claim is made here.

Expected local verification:

```powershell
git branch --show-current
git status --short --branch
git rev-parse HEAD
git rev-parse --abbrev-ref --symbolic-full-name '@{u}'
git log -1 --oneline
```

Expected baseline if the local branch is untouched: `stage/02-infrastructure` at `a378ff8`, tracking `origin/stage/02-infrastructure`, with a clean tree.

## 3. Authoritative Stage 02 scope

The roadmap defines Stage 02 as **Repository & Dev Infrastructure** with these major deliverables:

- project scaffold
- TypeScript/lint/format tooling
- test runners
- CI
- Docker development environment
- environment/config handling
- `.env.example`
- branch-protection setup where repository settings permit it

Stage 01 explicitly assigns the following to Stage 02:

- workspace/package tooling
- exact technology/tool versions
- testing framework selection
- browser E2E tool selection
- CI workflow implementation
- Docker/local MongoDB replica-set environment
- deployment topology implementation details, subject to DP-15/ADR requirements

Stage 02 may establish infrastructure boundaries and shells for `apps/api`, `apps/web`, `packages/contracts`, and `packages/config`, but must not implement business functionality.

## 4. Explicit non-scope

Stage 02 must not implement or partially implement:

### Database/domain

- Mongoose schemas/models
- domain indexes or database constraints
- repositories/data-access implementations
- migrations/seeds for business entities
- booking persistence
- authentication/session persistence

### Backend business capabilities

- authentication endpoints
- user/vehicle endpoints
- parking/facility/zone/slot endpoints
- search/availability
- booking engine
- payment/Razorpay integration
- reviews
- notifications
- recommendations
- admin/operator business workflows

### Security/business middleware

Stage 02 may establish infrastructure/configuration hooks, but the following belong to later stages:

- full authentication
- authorization policy enforcement
- rate-limiting behavior for production endpoints
- audit-log implementation
- payment verification/webhooks
- booking concurrency implementation
- application security headers/CORS policy implementation as Stage 04 behavior

### Testing

Do not add business/domain tests for functionality that does not yet exist. Stage 02 tests validate the scaffold/toolchain/infrastructure itself.

### Documentation

Do not rewrite Stage 01 architecture or completed Stage 00 requirements. Update only documents required by actual Stage 02 decisions/behavior.

## 5. Repository/workspace architecture

The approved monorepo shape is:

```text
ParkEase/
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   ├── contracts/
│   └── config/
├── docs/
├── scripts/
└── package.json
```

### Responsibilities

**apps/api**
- Node.js + Express + TypeScript shell.
- No domain routes/services/models in Stage 02.
- Provides only the minimum shell needed to prove the API toolchain works.

**apps/web**
- React + Vite + TypeScript shell.
- No business pages, authentication UI, booking UI, or domain features.

**packages/contracts**
- Shared transport-facing schemas/types.
- Must not import server-only dependencies.
- No business implementation.

**packages/config**
- Shared non-secret configuration helpers only.
- Configuration must not embed secrets.

**scripts**
- Developer/CI orchestration scripts where shell commands alone would become platform-fragile.
- Production application logic must not be placed here.

## 6. Toolchain plan

Stage 01 records the following technology direction:

| Area | Stage 02 plan |
|---|---|
| Runtime | Node.js 24.21.0, pinned in `.nvmrc` |
| Language | TypeScript 6.0.3, strict mode |
| Backend | Express.js 5.2.1 |
| Frontend | React 19.3.0 + Vite 8.3.2 |
| Database runtime | MongoDB 8.3.11, digest-pinned; local replica set through Docker |
| ODM | Mongoose dependency may be deferred until Stage 03 unless needed solely for an infrastructure verification |
| Boundary validation | Zod 4.6.5 for the shared health contract |
| Unit/API testing | Vitest + Supertest |
| Browser E2E | Playwright 1.63.0; scaffold only |
| Linting | ESLint |
| Formatting | Prettier |
| CI | GitHub Actions |
| Local services | Docker / Docker Compose-compatible development configuration |
| Package manager | npm workspaces; npm 11.19.0 in `packageManager`; lockfile v3 |

### Dependency policy

Every added dependency must have a documented reason tied to:

- a requirement;
- an approved architecture decision; or
- a necessary developer/CI infrastructure capability.

Dependencies must be:

- lockfile-pinned;
- installed reproducibly in CI;
- reviewed for transitive/security impact;
- kept minimal;
- free of unnecessary duplicate tooling.

Stage 02 must not add dependencies merely because they are conventional.

## 7. TypeScript enforcement

Production application and package code is TypeScript-only under ADR-001/OD-03.

Required infrastructure controls:

- strict TypeScript configuration;
- explicit project boundaries for production modules;
- type-check command covering all production application/package projects;
- CI type-check;
- no production JavaScript source;
- tooling/config formats remain exempt where the tool requires them.

The plan must distinguish production source from configuration/tooling files so enforcement does not incorrectly prohibit legitimate tool configuration.

## 8. Development environment

The local developer workflow must support:

1. install dependencies from the lockfile;
2. start the required infrastructure services;
3. run the API shell;
4. run the web shell;
5. execute type-check/lint/format/test commands;
6. shut down infrastructure cleanly.

Commands must be documented centrally in the repository package scripts and/or Stage 02 developer documentation rather than requiring undocumented manual steps.

The workflow must work on the project's supported development platform, including Windows/PowerShell for the owner's local environment, without depending on Unix-only shell behavior where avoidable.

## 9. Docker and MongoDB replica set

MongoDB is mandatory and ADR-003 requires a transaction-capable replica set for booking transactions.

Stage 02 therefore establishes a reproducible local MongoDB replica-set environment suitable for development and future transaction tests.

Infrastructure requirements:

- MongoDB runs as a replica set locally.
- Replica-set initialization is deterministic and idempotent.
- The application/test environment can connect using a documented replica-set connection string.
- Health/readiness is verifiable before transaction-dependent tests execute.
- Persistent local database volumes are treated as developer state and are never committed.
- Credentials, if used locally, are supplied through environment configuration rather than committed secrets.
- The setup must not imply that the local topology is a production deployment architecture.

Stage 02 does not create domain schemas or indexes.

## 10. Configuration/environment strategy

Configuration must be environment-driven and validated at process startup where applicable.

Required artifacts:

- `.env.example` containing placeholders only;
- documented development/test variables;
- separate concepts for development/test/CI configuration;
- no real credentials in Git;
- no hardcoded production secrets;
- no hardcoded localhost URLs in application source.

Configuration should expose infrastructure connection information without embedding environment-specific business assumptions.

Sensitive values must be read from environment/secret-manager mechanisms appropriate to the environment.

Stage 02 may establish a configuration loader/validation boundary, but it must not implement authentication, payment, or domain configuration semantics prematurely.

## 11. Testing infrastructure

Stage 02 wires the test architecture without pretending that later functionality exists.

Required categories supported by the infrastructure:

- unit;
- integration;
- API;
- database/transaction;
- frontend component;
- E2E/browser.

Only tests relevant to the Stage 02 scaffold are implemented now.

### Minimum Stage 02 validation

- TypeScript strict type-check succeeds.
- Lint executes and fails on real lint violations.
- Formatting check executes deterministically.
- Unit test runner executes a meaningful infrastructure/scaffold test.
- API test infrastructure can start/stop the API shell and exercise a non-business health/shell route if such a route is created.
- MongoDB replica-set connectivity/transaction capability is verified by an infrastructure test.
- Browser E2E runner can launch against the web shell only if selected as part of the Stage 02 implementation; no booking/auth flow is created.

No empty test files, unconditional passes, hidden skips, or tests whose only purpose is to make CI green.

## 12. CI strategy

GitHub Actions is the Stage 01 technology direction and Stage 02 implementation target.

CI must use a clean checkout and reproduce local validation.

Planned validation order:

1. checkout repository;
2. install the pinned Node/package-manager toolchain;
3. install dependencies from the lockfile;
4. validate formatting;
5. lint;
6. strict type-check;
7. unit/integration/infrastructure tests;
8. transaction-capable database tests using the Stage 02 MongoDB service setup;
9. build the API/web shells;
10. run any selected scaffold-level E2E check.

CI must fail on any required validation failure.

CI must not claim coverage of Stage 03+ business behavior.

CI should cache dependencies only in a way that cannot bypass lockfile correctness or produce false positives.

## 13. Git and repository workflow

Stage 02 work remains on:

`stage/02-infrastructure`

No direct work on `main`.

Expected flow:

```text
stage/02-infrastructure
    ↓
implementation commits
    ↓
tests/audit/fixes
    ↓
push branch
    ↓
PR to main
    ↓
human review + gate
    ↓
merge
```

Commits follow the existing conventional format. Infrastructure/security-sensitive changes use meaningful scopes and `security:` where appropriate.

Generated output, local databases, credentials, dependency caches, and build artifacts must be ignored and never committed.

## 14. Branch protection

The roadmap identifies branch protection as a Stage 02 deliverable where repository settings allow it.

The implementation plan should configure appropriate protection for `main` only after the required checks are known.

At minimum, the intended policy is:

- no direct unreviewed pushes to `main`;
- PR-based merge;
- required CI checks corresponding to the Stage 02 validation pipeline;
- human review consistent with the project's Definition of Done.

Exact GitHub settings are repository-owner decisions/permissions rather than application architecture. No branch-protection change is made by this plan.

## 15. Security considerations

Stage 02 infrastructure must preserve the architecture's security boundaries:

- no secrets committed;
- no real credentials in `.env.example`;
- no production credentials in Docker files;
- no authentication tokens in localStorage/sessionStorage;
- no hardcoded production endpoints;
- no wildcard credentialed CORS configuration;
- no dependency installation without justification;
- lockfile committed;
- CI secrets referenced only through GitHub's secret mechanism;
- generated artifacts excluded from source control;
- Docker configuration must not expose unnecessary host services/ports;
- developer database credentials, if present, must be placeholders/local-only;
- CI logs must not print secret environment variables;
- package scripts must not echo credentials.

Stage 02 does not claim that the application's full security baseline is complete; authentication, authorization, rate limiting, headers, CORS behavior, audit logging, and payment security remain later-stage implementation work.

## 16. Implementation sequence

Implementation proceeds in this order:

1. Re-verify local branch, baseline, working tree, and upstream.
2. Create the workspace/package-manager root configuration and lockfile.
3. Add strict TypeScript project configuration.
4. Create minimal API/web/contracts/config shells.
5. Establish ESLint and Prettier with deterministic commands.
6. Establish Vitest/Supertest and browser-test infrastructure as selected.
7. Establish configuration/environment foundations and `.env.example`.
8. Establish Docker local MongoDB replica-set infrastructure.
9. Add infrastructure health/readiness checks and transaction-capability verification.
10. Establish GitHub Actions CI.
11. Establish appropriate `main` branch protection if authorized/available.
12. Document the developer workflow and Stage 02 implementation decisions.
13. Run the full Stage 02 test/validation matrix.
14. Audit scope, secrets, dependencies, generated files, and architecture drift.
15. Fix findings and repeat validation.
16. Prepare the Stage 02 gate evidence and PR.

No step may introduce Stage 03 database/domain implementation.

## 17. Test and audit strategy

### Test evidence required

The final Stage 02 report must state exactly:

- commands executed;
- environment/tool versions actually used;
- tests executed and results;
- CI run and result, if available;
- Docker/MongoDB replica-set verification result;
- build/type/lint/format results;
- E2E scaffold result if applicable;
- checks not run and why.

### Audit evidence required

Audit must inspect:

- repository tree for generated/unintended files;
- package manifests and lockfile;
- TypeScript configuration;
- ESLint/Prettier configuration;
- test configuration;
- Docker files;
- CI workflow files;
- `.env.example`;
- ignore rules;
- package scripts;
- dependency justification;
- secret exposure;
- production-JavaScript violations;
- Stage 03+ scope leakage;
- consistency with ADR-001, ADR-003, ADR-004, ADR-008, ADR-010, and the architecture documents.

## 18. Stage 02 Definition of Done

Stage 02 is complete only when all are true:

### Repository
- [ ] Correct stage branch.
- [ ] Baseline verified.
- [ ] Working tree clean at gate.
- [ ] No unintended files.
- [ ] No generated artifacts committed.

### TypeScript/toolchain
- [ ] Production app/package code is TypeScript.
- [ ] Strict mode enforced.
- [ ] Type-check command succeeds.
- [ ] Workspace/package-manager setup is deterministic.
- [ ] Lockfile committed.
- [ ] Lint succeeds.
- [ ] Format check succeeds.
- [ ] Build succeeds.

### Testing
- [ ] Test runner executes real tests.
- [ ] Required infrastructure test categories are wired.
- [ ] MongoDB transaction capability is verified.
- [ ] No fake/empty tests.
- [ ] No skipped tests hiding failures.
- [ ] CI runs the intended Stage 02 validation.

### Docker/local infrastructure
- [ ] MongoDB replica set starts reproducibly.
- [ ] Replica set is usable by transaction-capable tests.
- [ ] Readiness is deterministic.
- [ ] Local-only state is ignored.

### CI
- [ ] Clean checkout succeeds.
- [ ] Dependency installation is lockfile-reproducible.
- [ ] Type-check/lint/format/tests/build execute.
- [ ] Required infrastructure service is available to relevant CI tests.
- [ ] Failures cause CI failure.

### Security
- [ ] No secrets committed.
- [ ] `.env.example` contains placeholders only.
- [ ] No production secrets are hardcoded.
- [ ] CI does not expose secrets.
- [ ] Dependency audit reviewed.
- [ ] Docker exposure reviewed.

### Scope
- [ ] No Stage 03+ business implementation.
- [ ] No database domain schemas/indexes.
- [ ] No auth/booking/payment/user/parking business logic.
- [ ] No architecture drift.
- [ ] No owner decision silently resolved.

### Documentation
- [ ] Stage 02 plan updated to reflect implemented decisions.
- [ ] Any significant Stage 02 decision has an ADR.
- [ ] Developer setup is reproducible from documentation.
- [ ] Gate evidence is recorded.

## 19. Stage 02 exit gate

The stage may PASS only if:

```text
PASS =
  repository clean
  AND correct stage branch
  AND deterministic install
  AND strict type-check passes
  AND lint passes
  AND format check passes
  AND scaffold builds
  AND infrastructure tests pass
  AND MongoDB replica-set capability verified
  AND CI validation passes
  AND no secrets exposed
  AND no Stage 03+ implementation
  AND documentation complete
  AND security/dependency/scope audit passes
  AND independent human review completed
```

Any failed criterion means:

`FIX → TEST → AUDIT → VERIFY AGAIN`

and the gate remains closed.

## 20. Open owner decisions / approvals

### OD-02A — DP-15: deployment target / MongoDB Atlas tier

**Status:** Owner decision required before production-oriented infrastructure implementation.

Stage 01/Stage 00 explicitly leave DP-15 deferred. Stage 02 may define a local development topology and CI service topology without selecting a production Atlas tier.

Required owner decision:

- deployment target for the eventual production environment;
- whether MongoDB production will use Atlas;
- if Atlas is selected, the initial tier/constraints.

This decision must be recorded in an ADR before infrastructure implementation makes production-specific assumptions.

### OD-02B — Stage 02 browser E2E tool

**Selected:** Playwright 1.63.0, documented in `02-local-development.md`. It runs a
scaffold-only Chromium test; no business E2E flow is included.

### OD-02C — Package manager

**Selected:** npm workspaces with npm 11.19.0 declared in `packageManager`; CI installs
and verifies that exact version. The lockfile is v3. The implementation and lockfile
remain uncommitted until the stage is reviewed.

### OD-02D — Exact tool versions

**Selected and verified:** Node.js 24.21.0 and exact direct dependency versions are
pinned in `.nvmrc` and package manifests. The dependency tree was inspected after
`npm ci`; see §25 for the audit result.

### Deferred decisions explicitly NOT required now

- DP-04 pending-booking hold duration → Stage 09 owner-approved ADR.
- DP-08 email provider → Stage 11.
- DP-10 recommendation policy → Stage 12.
- DP-12 numeric performance targets → owner-approved ADR before claims depend on them.
- DP-13 cancellation/refund policy parameters → Stage 09 owner-approved ADR.
- DP-16 repository license → Stage 16.

No Stage 02 implementation may silently resolve these.

## 21. Dependencies on Stage 03+

### Stage 03 — Database
Stage 02 provides the runtime and transaction-capable MongoDB environment. Stage 03 owns:

- Mongoose schemas;
- domain validators;
- indexes;
- database constraints;
- migrations/seeds;
- database documentation.

Stage 02 must not preempt those decisions.

### Stage 04 — Backend Foundation
Stage 02 provides API shell, configuration foundation, testing infrastructure, and CI. Stage 04 owns:

- production API application architecture;
- request IDs;
- centralized errors;
- logging;
- security headers;
- CORS;
- rate limiting;
- health endpoints;
- audit foundation;
- route-policy mechanism.

### Stage 05 — Authentication
Stage 02 must remain compatible with server-managed sessions, secure/httpOnly cookies, SameSite=Lax, layered CSRF, rotation, and server-side invalidation. It must not implement authentication persistence.

### Stage 09 — Booking
Stage 02 must provide a transaction-capable MongoDB replica set so ADR-003's slot serialization strategy can be implemented and tested later. It must not implement the reservation gate or booking state machine.

### Stage 10 — Payments
Stage 02 must support environment-specific secret configuration and CI secret handling without implementing Razorpay behavior.

### Stage 14/15 — Security and production readiness
Stage 02 provides deterministic CI/tooling foundations. Later stages own full security hardening, load testing, observability, backups, deployment, and production readiness.

## 22. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Toolchain drift between developer and CI | Pin Node/package manager; commit lockfile; run same scripts in CI |
| MongoDB transactions accidentally tested against standalone server | Require replica-set readiness and fail transaction-capability test if unavailable |
| Stage 02 grows into Stage 03 | Explicit non-scope; audit changed paths before gate |
| Dependency sprawl | Document reason for every dependency; prefer existing tools |
| Windows/CI shell mismatch | Prefer cross-platform package scripts and Node-based orchestration where shell portability matters |
| Secrets leak through CI/Docker | Placeholder env files, GitHub secrets, redaction, no secret echoing |
| Fake infrastructure tests | Require tests to exercise actual toolchain/service behavior |
| Production topology assumptions made too early | Keep local/CI topology explicit; resolve DP-15 before production-specific implementation |
| Tool configuration accidentally violates TS policy | Scope TS enforcement to production application/package code |
| E2E setup becomes a hidden business implementation | Test only the scaffold in Stage 02 |

## 23. Planned implementation outputs

Expected Stage 02 implementation artifacts, subject to this plan and later owner-approved tool choices:

```text
package.json
lockfile
tsconfig*.json
apps/api/**
apps/web/**
packages/contracts/**
packages/config/**
scripts/**
Docker configuration
.env.example
.gitignore updates where required
ESLint configuration
Prettier configuration
test configuration
GitHub Actions workflow(s)
Stage 02 developer/setup documentation
Stage 02 decision ADR(s), if required
```

These are planned outputs, not claims that the files currently exist.

## 24. Gate status

**IMPLEMENTATION IN PROGRESS — EXIT GATE NOT VALIDATED**

The implementation and validation evidence must be completed before the stage gate can pass.

## 25. Local verification evidence (2026-10-06)

The following is local evidence for this working tree, not a GitHub Actions result.

- **Repository:** branch `stage/02-infrastructure`; `HEAD` is
  `1ba658f3e30f425d595a8a2ddc9a06c43086b8f6`, tracking
  `origin/stage/02-infrastructure`. The `HEAD` baseline is the expected
  `a378ff8ec928ef1a2d910391c6fe18fbd25c09eb`. At the time of this recorded
  verification, the Stage 02 implementation remained untracked/uncommitted and no
  files were staged.
- **Docker:** Docker Engine 29.8.1 and Compose 5.5.1 are available, and
  `docker compose -f docker-compose.yml config --quiet` succeeds.
- **MongoDB:** the digest-pinned local MongoDB 8.3.11 container reported healthy.
  `hello()` identified `rs0` and `isWritablePrimary: true`; `rs.status()` reported
  one healthy `PRIMARY`. The published host port was `127.0.0.1:27017` only. The
  documented local connection string was used for transaction tests.
- **Transactions:** `npm run test:db` passed twice before restart and twice after
  restart (including in the full root validation sequence); each run executed all
  three tests, including multi-document commit and rollback assertions.
- **Restart:** `npm run infra:stop` removed the Compose container while retaining
  local volume state. `npm run infra:start` reinitialized idempotently, waited for a
  writable primary, and the transaction tests passed again.
- **Toolchain/install:** Node.js 24.21.0 and npm 11.19.0 matched `.nvmrc` and
  `packageManager`. `npm ci` succeeded from the lockfile (346 packages installed);
  npm reported one unapproved `esbuild@0.28.2` install script, but installation,
  build, and E2E execution succeeded without approving it.
- **Validation after clean install:** `npm run format:check`, `npm run lint`,
  `npm run typecheck`, `npm run test:unit`, `npm run test:integration`,
  `npm run test:db`, `npm run test:e2e`, and
  `npm run build --workspaces --if-present` all passed.
- **Dependency/security audit:** `npm audit` reported 0 vulnerabilities. Direct
  dependencies are exactly pinned; the dependency tree was inspected.
- **Scope/secrets/artifacts:** no production JavaScript source or Stage 03+ business
  implementation was found. Secret-pattern scans found no credential indicators;
  `.env.example` contains local placeholders only. Generated `node_modules`, build
  output, and test results remain ignored and unstaged.
- **CI:** **CI execution not independently verified.** No GitHub Actions run was
  available for this uncommitted working-tree state. Workflow configuration was
  inspected for clean checkout, pinned Node/npm, `npm ci`, quality checks, Compose
  replica-set transaction tests, E2E, and builds; this does not establish CI success.
- **Branch protection:** active repository ruleset `Protect main` (ID `24593398`)
  targets `refs/heads/main`, requires a PR and one approving review, blocks force
  pushes and deletion, and has no bypass actors. No required status checks are
  configured because no CI check run has established the exact check names.
- **Still required:** actual CI evidence for the committed changes and independent
  human review. DP-15 remains deferred as documented above.

The stage remains **NOT PASSED** until the exit-gate conditions in §19 are satisfied.

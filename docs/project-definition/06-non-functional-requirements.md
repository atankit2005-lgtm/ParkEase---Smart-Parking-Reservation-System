# 06 — Non-Functional Requirements

Targets below are initial and testable; numeric thresholds remain open per DP-12 (deferred, requiring an owner-approved ADR before any implementation/testing claim depends on them) and are recorded here as written commitments, not fixed values. They are not claims about current system behavior.

| ID | Category | Requirement | Verification |
|---|---|---|---|
| NFR-SEC-01 | Security | All SEC-* requirements met; no high/critical known vulnerabilities in dependencies at release | Audit stage 14, `npm audit`/equivalent in CI |
| NFR-SEC-02 | Security | 100% of routes have declared auth/role policy; verified by automated route inventory test | Test |
| NFR-PERF-01 | Performance | Search and availability queries use indexes; no unbounded result sets; no N+1 query patterns on list endpoints | Query review, explain plans |
| NFR-PERF-02 | Performance | Target p95 API latency for read endpoints under nominal load (threshold DP-12) | Load test stage 14/15 |
| NFR-REL-01 | Reliability | Multi-step critical operations (booking, cancellation, payment confirmation) are atomic or compensating; failures leave consistent state | Fault-injection integration tests |
| NFR-REL-02 | Reliability | Provider events and client retries are idempotent | Tests |
| NFR-SCAL-01 | Scalability | Stateless API processes; horizontal scaling possible without premature distributed complexity | Architecture review |
| NFR-MNT-01 | Maintainability | Layered backend (routes/controllers/services/data access/validation/middleware/config); no giant files; limits set in 09-engineering-standards | Lint, review |
| NFR-TEST-01 | Testability | Core business logic testable without HTTP or live provider; provider behind an interface | Unit tests |
| NFR-A11Y-01 | Accessibility | Frontend targets WCAG 2.1 AA for core journeys (keyboard, labels, contrast, focus) | Automated + manual checks |
| NFR-USE-01 | Usability | Loading, error, and empty states on every data view; forms show server validation errors | Frontend tests |
| NFR-AVAIL-01 | Availability | Liveness/readiness endpoints; graceful shutdown; dependency health reported | Tests |
| NFR-INT-01 | Data integrity | Invariants enforced server-side and, where possible, by database constraints (unique/compound indexes, schema validation) | DB tests |
| NFR-PRIV-01 | Privacy | Collect/retain only justified data; retention and deletion policy defined (DP-10); PII minimization in logs and operator views | Review |
| NFR-AUD-01 | Auditability | Sensitive admin/operator actions are traceable with actor, target, time, outcome; audit store append-only | Tests |
| NFR-OBS-01 | Observability | Structured logs with correlation IDs; no secrets/PII in logs | Review, tests |

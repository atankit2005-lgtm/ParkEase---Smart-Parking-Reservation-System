# ADR-004 — Time and Time Zones

- **Status:** Proposed — owner review required
- **Date:** 2026-10-03
- **Decision point:** DP-14 — owner resolved

## Decision
- Initial market: India.
- Initial currency: INR.
- Persist timestamps as UTC instants.
- Every facility stores an IANA timezone identifier.
- Operating hours are interpreted in the facility's local timezone.
- Booking input that represents business-local time is interpreted using the facility timezone, then normalized to UTC for persistence/comparison.
- API responses use ISO 8601 UTC instants unless a business-local representation is explicitly required.
- Internationalization and multiple currencies remain deferred.

## Time model

```text
storage        — UTC instants only (booking windows, holds, expiry, audit, sessions)
facility zone  — IANA identifier stored on the facility; the only authority for local interpretation
local inputs   — business-local date/time inputs are interpreted in the facility zone,
                 then normalized to UTC once, at the boundary
comparisons    — all interval arithmetic (overlap, operating hours, duration, expiry)
                 is performed on UTC instants
display        — clients may render UTC instants in any display timezone; display never
                 feeds back into validation
```

### Interval comparison rules

- A booking window is the half-open interval `[startUtc, endUtc)`; overlap is `A.start < B.end AND B.start < A.end` (ADR-003). Half-open semantics make back-to-back bookings non-overlapping.
- Operating-hour and duration validation is defined on facility-local wall-clock rules but evaluated by converting to/from UTC through the facility's IANA zone — never through fixed offsets or client-reported offsets.
- Because India (Asia/Kolkata, no DST) is the initial market, local↔UTC conversion is currently unambiguous; the architecture must nonetheless behave correctly for zones with DST (see below).

## DST transitions — OD-02: OWNER DECISION REQUIRED

In a DST-observing timezone, a local date/time can be **ambiguous** (fallback: the wall clock shows the same time twice) or **nonexistent** (spring-forward: the wall clock skips a range). The architecture must define one behavior for facility-local booking inputs; the repository contains no prior authority resolving this, so it is explicitly pending.

| Option | Ambiguous local times | Nonexistent local times | Notes |
|---|---|---|---|
| **A** | Reject with a validation error asking for a different time | Reject with a validation error | Simplest, safest semantics; zero ambiguity ever reaches storage; no impact on the India-only initial market |
| **B** | Accept only when the request carries an explicit UTC offset that resolves the ambiguity; otherwise reject | Reject | More flexible for future international facilities; adds offset-validation complexity and a client-facing concept |

**Agent recommendation (not a decision): Option A.** It cannot misinterpret a customer's intent, requires no offset plumbing, and is sufficient while the market is India-only. Option B can be adopted later by a new owner decision if internationalization introduces real demand; choosing A now does not block that path.

Until OD-02 is resolved: this ADR must not be treated as authorizing either behavior, and Stage 09 booking-validation implementation is blocked on this decision only to the extent a non-India facility timezone is used. Centralized time utilities (below) must be designed so either option can be implemented without architectural change.

## Validation
Booking validation must account for:
- start before end;
- past-time tolerance;
- operating hours;
- maximum duration;
- daylight-saving transitions for future facilities even though India is the initial market;
- ambiguous/nonexistent local times — behavior per OD-02 above (owner decision required).

## Consequences
Time utilities must be centralized and tested. Client-side date calculations cannot establish booking validity. Conversion between local and UTC happens only through the centralized utilities using the facility's IANA zone; fixed-offset arithmetic and client-supplied offsets are never authoritative.

## Implementation boundary
Exact libraries, schemas, and DST test fixtures belong to Stages 02–03 and 09.

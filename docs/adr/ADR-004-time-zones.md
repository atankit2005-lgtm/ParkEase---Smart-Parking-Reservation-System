# ADR-004 — Time and Time Zones

- **Status:** Accepted — owner approved (2026-10-03)
- **Date:** 2026-10-03
- **Decision points:** DP-14 — owner resolved; OD-02 (DST/local-time handling) — owner approved Option B (2026-10-03)

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
- Operating-hour and duration validation is defined on facility-local wall-clock rules but evaluated by converting to/from UTC through the facility's IANA zone — never through fixed offsets, and through a client-supplied offset only in the single OD-02 ambiguous-time disambiguation case (see below), where the offset is validated against the zone and used solely to select the intended instant at the input boundary. All downstream validation then proceeds on the resulting UTC instant and the IANA zone.
- Because India (Asia/Kolkata, no DST) is the initial market, local↔UTC conversion is currently unambiguous; the architecture must nonetheless behave correctly for zones with DST (see below).

## DST transitions — OD-02: RESOLVED / OWNER APPROVED (Option B)

The owner approved **Option B** on 2026-10-03. In a DST-observing timezone, a local date/time can be **ambiguous** (fallback: the wall clock maps one local time to two distinct UTC instants) or **nonexistent** (spring-forward: the wall clock skips a range). The following behavior is now a binding architectural decision.

- **Ambiguous local time** — accepted **only** when the request carries an explicit UTC offset that resolves which of the two instants is intended.
  - The supplied offset is **validated against the facility's IANA zone**: it is accepted only if it is one of the offsets that zone actually observes at that local time. An offset that does not match the zone is rejected as invalid input, never coerced.
  - If the offset is absent, or matches neither valid offset, the ambiguous local time is **rejected** with a validation error.
  - The system **never silently chooses** an offset for an ambiguous local time — no default to the earlier/later/standard/DST instance.
- **Nonexistent local time** — **rejected** with a validation error. No offset can rescue a nonexistent local time, and none is invented.
- **All other local times** (the normal case, and always for the initial India / Asia-Kolkata market, which has no DST) map to exactly one UTC instant and require no offset; behavior is unchanged.

### Authority rule (unchanged, now explicit)

The facility's IANA zone remains the **single authority** for local↔UTC interpretation. The explicit offset permitted for an ambiguous time is a **disambiguator validated against that zone** — it may only select among the zone's own valid offsets and can never shift a time to an instant the zone does not produce. This preserves the security invariant that clients cannot use an arbitrary offset to move a stored instant; fixed-offset arithmetic remains non-authoritative everywhere else.

### Alternatives considered
Option A (reject both ambiguous and nonexistent local times, no offset plumbing) was considered and recommended by the authoring agent, but the owner selected Option B for future international flexibility. Centralized time utilities must implement the offset-validated disambiguation and the nonexistent-time rejection with dedicated DST test fixtures (Stage 09).

## Validation
Booking validation must account for:
- start before end;
- past-time tolerance;
- operating hours;
- maximum duration;
- daylight-saving transitions for future facilities even though India is the initial market;
- ambiguous local times — require an explicit UTC offset validated against the facility zone, otherwise reject (OD-02 Option B);
- nonexistent local times — always reject (OD-02 Option B).

## Consequences
Time utilities must be centralized and tested. Client-side date calculations cannot establish booking validity. Conversion between local and UTC happens only through the centralized utilities using the facility's IANA zone. Fixed-offset arithmetic is never authoritative. The only client-supplied offset permitted is the optional disambiguator for an ambiguous local time under OD-02 Option B; it is validated against the facility's IANA zone (accepted only if it is one the zone actually observes at that local time) and can never override the zone or shift a stored instant.

## Implementation boundary
Exact libraries, schemas, and DST test fixtures belong to Stages 02–03 and 09.

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

## Validation
Booking validation must account for:
- start before end;
- past-time tolerance;
- operating hours;
- maximum duration;
- daylight-saving transitions for future facilities even though India is the initial market;
- ambiguous/nonexistent local times where a future timezone can encounter them.

## Consequences
Time utilities must be centralized and tested. Client-side date calculations cannot establish booking validity.

## Implementation boundary
Exact libraries, schemas, and DST test fixtures belong to Stages 02–03 and 09.

import { describe, expect, it } from "vitest";

import { apiHealthResponseSchema, isoUtcDateTimeSchema } from "../../src/index.js";

describe("isoUtcDateTimeSchema", () => {
  it("accepts an ISO 8601 UTC instant", () => {
    expect(isoUtcDateTimeSchema.safeParse("2026-10-04T12:30:00.000Z").success).toBe(true);
  });

  it("rejects a non-UTC offset", () => {
    expect(isoUtcDateTimeSchema.safeParse("2026-10-04T12:30:00.000+05:30").success).toBe(false);
  });

  it("rejects non-ISO date strings", () => {
    expect(isoUtcDateTimeSchema.safeParse("2026-10-04 12:30:00").success).toBe(false);
    expect(isoUtcDateTimeSchema.safeParse("not-a-date").success).toBe(false);
  });
});

describe("apiHealthResponseSchema", () => {
  it("accepts a well-formed health payload", () => {
    const result = apiHealthResponseSchema.safeParse({
      status: "ok",
      timestamp: "2026-10-04T12:30:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unexpected status value", () => {
    const result = apiHealthResponseSchema.safeParse({
      status: "degraded",
      timestamp: "2026-10-04T12:30:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-UTC timestamp", () => {
    const result = apiHealthResponseSchema.safeParse({
      status: "ok",
      timestamp: "2026-10-04T12:30:00.000+05:30",
    });
    expect(result.success).toBe(false);
  });
});

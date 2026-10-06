import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../src/app.js";

describe("GET /health", () => {
  it("responds 200 with status ok and an ISO 8601 UTC timestamp", async () => {
    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "ok" });
    expect(typeof response.body.timestamp).toBe("string");
    expect(response.body.timestamp.endsWith("Z")).toBe(true);
  });

  it("does not expose the X-Powered-By header", async () => {
    const response = await request(createApp()).get("/health");

    expect(response.headers["x-powered-by"]).toBeUndefined();
  });
});

import express, { type Express } from "express";

import { apiHealthResponseSchema } from "@parkease/contracts";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());

  app.get("/health", (_req, res) => {
    const payload = apiHealthResponseSchema.parse({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
    res.json(payload);
  });

  return app;
}

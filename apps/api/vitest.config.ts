import { defineConfig } from "vitest/config";

import "./src/load-local-env.js";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});

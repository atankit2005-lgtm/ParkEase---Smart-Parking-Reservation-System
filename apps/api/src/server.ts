import "./load-local-env.js";
import { createApp } from "./app.js";

const port = Number(process.env["API_PORT"] ?? 3000);

const app = createApp();

app.listen(port, () => {
  console.log(`parkease-api listening on port ${port}`);
});

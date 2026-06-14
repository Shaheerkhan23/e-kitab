import { createApp } from "./app.js";
import { env } from "./lib/env.js";
import "./db/index.js";
import { seed } from "./db/seed.js";

seed();

const app = createApp();

app.listen(env.port, () => {
  console.log(`API server listening on http://localhost:${env.port}`);
});

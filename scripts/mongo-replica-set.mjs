import { execFile } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const COMPOSE_FILE = fileURLToPath(new URL("../docker-compose.yml", import.meta.url));
const REPLICA_SET = "rs0";
const PRIMARY_WAIT_MS = 30_000;
const PRIMARY_POLL_MS = 1_000;

function run(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        const detail = [stderr.trim(), stdout.trim()].filter(Boolean).join("\n");
        reject(new Error(`${command} ${args.join(" ")} failed: ${detail || error.message}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

function dockerCompose(args) {
  return run("docker", ["compose", "--file", COMPOSE_FILE, ...args]);
}

async function mongoshEval(script) {
  const output = await dockerCompose([
    "exec",
    "-T",
    "mongodb",
    "mongosh",
    "--quiet",
    "--eval",
    script,
  ]);
  return output;
}

async function waitForPrimary() {
  const deadline = Date.now() + PRIMARY_WAIT_MS;
  let lastState = "unknown";

  while (Date.now() < deadline) {
    try {
      const state = await mongoshEval("rs.status().myState");
      lastState = state;
      if (state.trim() === "1") {
        return;
      }
    } catch {
      // Container still starting; keep polling.
    }
    await delay(PRIMARY_POLL_MS);
  }

  throw new Error(`Timed out waiting for replica set primary (last rs.myState: ${lastState})`);
}

async function start() {
  await dockerCompose(["up", "-d", "--wait"]);
  await mongoshEval(
    `try { rs.initiate({ _id: "${REPLICA_SET}", members: [{ _id: 0, host: "localhost:27017" }] }); } catch (e) { if (String(e.codeName) !== "AlreadyInitialized") { throw e; } }`,
  ).catch((error) => {
    if (!String(error.message).includes("AlreadyInitialized")) {
      throw error;
    }
  });
  await waitForPrimary();
  console.log(`MongoDB replica set "${REPLICA_SET}" is up with a primary on localhost:27017`);
}

async function stop() {
  await dockerCompose(["down"]);
  console.log("MongoDB replica set stopped");
}

async function status() {
  const ps = await dockerCompose(["ps"]);
  console.log(ps || "(no containers)");
  try {
    const hello = await mongoshEval("JSON.stringify(db.getSiblingDB('admin').hello())");
    console.log(hello);
  } catch (error) {
    console.log(`Replica set status unavailable: ${error.message.split("\n")[0]}`);
  }
}

async function main() {
  const command = process.argv[2];

  if (command === "start") {
    await start();
  } else if (command === "stop") {
    await stop();
  } else if (command === "status") {
    await status();
  } else {
    console.error("Usage: node scripts/mongo-replica-set.mjs <start|stop|status>");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const message = String(error.message);
  if (message.includes("ENOENT") || message.startsWith("docker ")) {
    console.error("Docker was not found on PATH. Install Docker Desktop and ensure it is running.");
  }
  console.error(message);
  process.exitCode = 1;
});

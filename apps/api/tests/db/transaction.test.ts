import { MongoClient } from "mongodb";
import { afterAll, describe, expect, it } from "vitest";

const MONGO_URL =
  process.env["MONGO_URL"] ?? "mongodb://127.0.0.1:27017/?directConnection=true&replicaSet=rs0";
const TEST_DB = "parkease-stage02-transaction-test";
const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const client = new MongoClient(MONGO_URL);

interface Probe {
  _id: string;
  probe: string;
}

function probes() {
  return client.db(TEST_DB).collection<Probe>("probes");
}

async function runCommitProbe() {
  const collection = probes();
  const firstId = `commit-a-${runId}`;
  const secondId = `commit-b-${runId}`;

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await collection.insertOne({ _id: firstId, probe: "commit" }, { session });
      await collection.insertOne({ _id: secondId, probe: "commit" }, { session });
    });
  } finally {
    await session.endSession();
  }

  const first = await collection.findOne({ _id: firstId });
  const second = await collection.findOne({ _id: secondId });
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
}

async function runAbortProbe() {
  const collection = probes();
  const firstId = `abort-a-${runId}`;
  const secondId = `abort-b-${runId}`;

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await collection.insertOne({ _id: firstId, probe: "abort" }, { session });
      await collection.insertOne({ _id: secondId, probe: "abort" }, { session });
      throw new Error("force abort");
    });
  } catch (error) {
    if (error instanceof Error && error.message !== "force abort") {
      throw error;
    }
  } finally {
    await session.endSession();
  }

  const first = await collection.findOne({ _id: firstId });
  const second = await collection.findOne({ _id: secondId });
  expect(first).toBeNull();
  expect(second).toBeNull();
}

describe("MongoDB replica set transaction capability", () => {
  afterAll(async () => {
    await probes().deleteMany({ _id: { $regex: `-${runId}$` } });
    await client.close();
  });

  it("connects to a replica set named rs0", async () => {
    const hello = await client.db("admin").command({ hello: 1 });
    expect(hello["setName"]).toBe("rs0");
  });

  it("commits a multi-document transaction", async () => {
    await runCommitProbe();
  });

  it("rolls back a transaction when the callback throws", async () => {
    await runAbortProbe();
  });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import path from "path";
import fs from "fs";
import app from "../index.js";
import { closeDb } from "../db/sqlite.js";

const testDbPath = path.join(process.cwd(), "data", "test-submissions.db");

const validPayload = {
  companyName: "API Test Co",
  sector: "Finance",
  objective: "Create a fintech landing page for lead generation",
  audience: "CFOs and finance directors",
  neededServices: ["Web Design", "Content"],
  budgetRange: "$15,000 - $50,000",
  deadline: "2030-08-01",
  aiMode: "mock",
};

describe("POST /api/briefs", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "test";
    process.env.DB_PATH = testDbPath;
    closeDb();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  });

  afterAll(() => {
    closeDb();
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch {
        // Windows may keep the file locked briefly; safe to ignore in tests
      }
    }
  });

  it("returns 201 with expected shape for valid payload", async () => {
    const res = await request(app)
      .post("/api/briefs")
      .send(validPayload)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.headline).toBeDefined();
    expect(
      res.body.data.summary.discoveryQuestions.length,
    ).toBeGreaterThanOrEqual(4);
    expect(res.body.data.aiModeUsed).toBe("mock");
  });

  it("returns 400 with fieldErrors for invalid payload", async () => {
    const res = await request(app)
      .post("/api/briefs")
      .send({ companyName: "x" })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.fieldErrors).toBeDefined();
  });
});

describe("GET /api/briefs", () => {
  it("returns recent submissions", async () => {
    const res = await request(app).get("/api/briefs").expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { mockProvider } from "./mockProvider.service.js";
import type { BriefSubmissionInput } from "../../types/brief.js";

const input: BriefSubmissionInput = {
  companyName: "TestCo",
  sector: "Technology",
  objective: "Build a modern marketing website",
  audience: "Small business owners",
  neededServices: ["Web Design", "SEO"],
  budgetRange: "$5,000 - $15,000",
  deadline: "2030-06-01",
  aiMode: "mock",
};

describe("MockProvider", () => {
  it("returns deterministic output for identical input", async () => {
    const a = await mockProvider.generateBrief(input);
    const b = await mockProvider.generateBrief(input);
    expect(a).toEqual(b);
  });

  it("returns 4 to 6 discovery questions", async () => {
    const result = await mockProvider.generateBrief(input);
    expect(result.discoveryQuestions.length).toBeGreaterThanOrEqual(4);
    expect(result.discoveryQuestions.length).toBeLessThanOrEqual(6);
    expect(result.headline).toContain("TestCo");
  });
});

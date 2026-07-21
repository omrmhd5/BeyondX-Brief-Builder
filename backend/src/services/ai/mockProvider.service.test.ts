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

  it("completes with fully custom sector, services, and budget", async () => {
    const start = Date.now();
    const result = await mockProvider.generateBrief({
      companyName: "Custom Hotel Group",
      sector: "Hospitality & Tourism",
      objective: "Launch a new booking website for boutique hotels",
      audience: "Leisure and business travelers",
      neededServices: ["Video Production", "Consulting", "Event Marketing"],
      budgetRange: "$25,000 USD flexible",
      deadline: "2030-06-15",
      aiMode: "mock",
    });

    expect(Date.now() - start).toBeLessThan(1000);
    expect(result.discoveryQuestions.length).toBeGreaterThanOrEqual(4);
  });
});

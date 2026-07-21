import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateBrief } from "./briefGeneration.service.js";
import type { BriefSubmissionInput } from "../types/brief.js";

const input: BriefSubmissionInput = {
  companyName: "Fallback Test",
  sector: "Retail",
  objective: "Improve online store conversion rates",
  audience: "Online shoppers aged 25-45",
  neededServices: ["Ads"],
  budgetRange: "Under $5,000",
  deadline: "2030-01-15",
  aiMode: "real",
};

describe("generateBrief fallback", () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalKey) {
      process.env.GEMINI_API_KEY = originalKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  it("falls back to mock when real mode selected but no API key", async () => {
    const result = await generateBrief(input);
    expect(result.fallbackApplied).toBe(true);
    expect(result.fallbackReason).toBe("no_api_key");
    expect(result.aiModeUsed).toBe("mock");
    expect(result.summary.discoveryQuestions.length).toBeGreaterThanOrEqual(4);
  });
});

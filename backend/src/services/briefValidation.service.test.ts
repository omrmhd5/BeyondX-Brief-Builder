import { describe, it, expect } from "vitest";
import { validateBriefInput } from "./briefValidation.service.js";

const validPayload = {
  companyName: "Acme Corp",
  sector: "Technology",
  objective: "Launch a new product website to increase leads",
  audience: "B2B SaaS decision makers",
  neededServices: ["Web Design", "SEO"],
  budgetRange: "$15,000 - $50,000",
  deadline: "2030-12-31",
  aiMode: "mock" as const,
};

describe("validateBriefInput", () => {
  it("accepts a valid payload", () => {
    const result = validateBriefInput(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyName).toBe("Acme Corp");
    }
  });

  it("rejects missing companyName", () => {
    const { companyName: _, ...rest } = validPayload;
    const result = validateBriefInput(rest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.companyName).toBeDefined();
    }
  });

  it("rejects empty neededServices", () => {
    const result = validateBriefInput({ ...validPayload, neededServices: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.neededServices).toBeDefined();
    }
  });

  it("rejects invalid aiMode", () => {
    const result = validateBriefInput({ ...validPayload, aiMode: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts custom sector, services, and budget", () => {
    const result = validateBriefInput({
      ...validPayload,
      sector: "Hospitality & Tourism",
      neededServices: ["Web Design", "Video Production"],
      budgetRange: "$25,000 USD",
    });
    expect(result.success).toBe(true);
  });
});

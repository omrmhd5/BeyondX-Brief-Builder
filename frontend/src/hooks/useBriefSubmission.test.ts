import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBriefSubmission } from "./useBriefSubmission";
import * as briefsApi from "../api/briefsApi";

vi.mock("../api/briefsApi", async (importOriginal) => {
  const actual = await importOriginal<typeof briefsApi>();
  return {
    ...actual,
    submitBrief: vi.fn(),
  };
});

describe("useBriefSubmission", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("sets error state when API returns validation error", async () => {
    vi.mocked(briefsApi.submitBrief).mockResolvedValue({
      success: false,
      error: {
        message: "Validation failed",
        fieldErrors: { companyName: "Too short" },
      },
    });

    const { result } = renderHook(() => useBriefSubmission());

    await act(async () => {
      await result.current.submit({
        companyName: "A",
        sectorPreset: "Technology",
        sectorCustom: "",
        objective: "Test objective here",
        audience: "Developers",
        neededServices: ["Web Design"],
        customServices: "",
        budgetPreset: "$5,000 - $15,000",
        customBudgetAmount: "",
        deadline: "2030-01-01",
        aiMode: "mock",
      });
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });
    expect(result.current.state.fieldErrors?.companyName).toBe("Too short");
  });
});

import type {
  BriefCreateResponse,
  BriefSubmissionInput,
} from "../types/brief.js";
import { createGeminiProvider } from "./ai/geminiProvider.service.js";
import { mockProvider } from "./ai/mockProvider.service.js";

export async function generateBrief(
  input: BriefSubmissionInput,
): Promise<BriefCreateResponse> {
  if (input.aiMode === "mock") {
    const summary = await mockProvider.generateBrief(input);
    return {
      summary,
      aiModeUsed: "mock",
      fallbackApplied: false,
    };
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const summary = await mockProvider.generateBrief(input);
    return {
      summary,
      aiModeUsed: "mock",
      fallbackApplied: true,
      fallbackReason: "no_api_key",
    };
  }

  try {
    const gemini = createGeminiProvider();
    const summary = await gemini.generateBrief(input);
    return {
      summary,
      aiModeUsed: "real",
      fallbackApplied: false,
    };
  } catch (error) {
    console.error("[briefGeneration] Gemini fallback:", error);
    const summary = await mockProvider.generateBrief(input);
    return {
      summary,
      aiModeUsed: "mock",
      fallbackApplied: true,
      fallbackReason: "provider_error",
    };
  }
}

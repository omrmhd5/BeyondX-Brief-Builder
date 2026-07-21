import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { BriefSubmissionInput, BriefSummary } from "../../types/brief.js";
import type { AiProvider } from "./aiProvider.interface.js";

const summarySchema = z.object({
  headline: z.string().min(1),
  keyPoints: z.array(z.string()).min(1),
  recommendedApproach: z.string().min(1),
  discoveryQuestions: z.array(z.string()).min(4).max(6),
});

const TIMEOUT_MS = 10000;

function buildPrompt(input: BriefSubmissionInput): string {
  return `You are a senior agency strategist. Generate a structured project brief summary as JSON only (no markdown).

Input:
- Company: ${input.companyName}
- Sector: ${input.sector}
- Objective: ${input.objective}
- Audience: ${input.audience}
- Services needed: ${input.neededServices.join(", ")}
- Budget: ${input.budgetRange}
- Deadline: ${input.deadline}

Return JSON with this exact shape:
{
  "headline": "string",
  "keyPoints": ["string", ...],
  "recommendedApproach": "string",
  "discoveryQuestions": ["string", ...]  // exactly 4 to 6 questions
}`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenceMatch ? fenceMatch[1].trim() : trimmed;
  return JSON.parse(raw);
}

export class GeminiProvider implements AiProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateBrief(input: BriefSubmissionInput): Promise<BriefSummary> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const text = result.response.text();
      const parsed = summarySchema.parse(extractJson(text));
      return parsed;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gemini provider failed";
      throw new Error(`GeminiProvider error: ${message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createGeminiProvider(): GeminiProvider {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GeminiProvider(apiKey);
}

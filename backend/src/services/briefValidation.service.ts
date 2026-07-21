import { z } from "zod";
import {
  BUDGET_RANGES,
  SECTORS,
  SERVICE_OPTIONS,
  type BriefSubmissionInput,
} from "../types/brief.js";

const briefInputSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be at most 100 characters"),
  sector: z.enum(SECTORS, { errorMap: () => ({ message: "Invalid sector" }) }),
  objective: z
    .string()
    .trim()
    .min(10, "Objective must be at least 10 characters")
    .max(1000, "Objective must be at most 1000 characters"),
  audience: z
    .string()
    .trim()
    .min(5, "Audience must be at least 5 characters")
    .max(500, "Audience must be at most 500 characters"),
  neededServices: z
    .array(z.enum(SERVICE_OPTIONS))
    .min(1, "Select at least one service"),
  budgetRange: z.enum(BUDGET_RANGES, {
    errorMap: () => ({ message: "Invalid budget range" }),
  }),
  deadline: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid deadline date")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "Deadline cannot be in the past"),
  aiMode: z.enum(["mock", "real"]),
});

export type ValidationResult =
  | { success: true; data: BriefSubmissionInput }
  | { success: false; fieldErrors: Record<string, string> };

export function validateBriefInput(payload: unknown): ValidationResult {
  const result = briefInputSchema.safeParse(payload);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { success: false, fieldErrors };
  }

  return { success: true, data: result.data };
}

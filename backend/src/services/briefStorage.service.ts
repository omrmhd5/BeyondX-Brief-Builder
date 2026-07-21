import {
  getLastN,
  insertSubmission,
  pruneOlderThanLastN,
} from "../models/submission.model.js";
import type {
  BriefCreateResponse,
  BriefSubmissionInput,
  BriefSummary,
  StoredSubmission,
} from "../types/brief.js";

export function saveSubmission(
  input: BriefSubmissionInput,
  result: BriefCreateResponse,
): number {
  const id = insertSubmission({
    companyName: input.companyName,
    sector: input.sector,
    objective: input.objective,
    audience: input.audience,
    neededServices: input.neededServices,
    budgetRange: input.budgetRange,
    deadline: input.deadline,
    summary: result.summary,
    aiModeUsed: result.aiModeUsed,
    fallbackApplied: result.fallbackApplied,
  });

  pruneOlderThanLastN(5);
  return id;
}

export function listRecentSubmissions(): StoredSubmission[] {
  return getLastN(5).map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    companyName: row.companyName,
    sector: row.sector,
    objective: row.objective,
    audience: row.audience,
    neededServices: JSON.parse(row.neededServices) as string[],
    budgetRange: row.budgetRange,
    deadline: row.deadline,
    summary: JSON.parse(row.summaryJson) as BriefSummary,
    aiModeUsed: row.aiModeUsed,
    fallbackApplied: row.fallbackApplied === 1,
  }));
}

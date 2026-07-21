import type { BriefSubmissionInput, BriefSummary } from "../../types/brief.js";

export interface AiProvider {
  generateBrief(input: BriefSubmissionInput): Promise<BriefSummary>;
}

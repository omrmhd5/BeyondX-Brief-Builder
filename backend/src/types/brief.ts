/**
 * API Contract
 *
 * POST /api/briefs
 * Request body: BriefSubmissionInput
 * Success 201: { success: true, data: BriefCreateResponse }
 * Error 400: { success: false, error: { message, fieldErrors? } }
 *
 * GET /api/briefs
 * Success 200: { success: true, data: StoredSubmission[] }
 */

export type AiMode = "mock" | "real";

export const SECTORS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Education",
  "Manufacturing",
  "Other",
] as const;

export const SERVICE_OPTIONS = [
  "Web Design",
  "Branding",
  "SEO",
  "Content",
  "Ads",
  "App Dev",
] as const;

export const BUDGET_RANGES = [
  "Under $5,000",
  "$5,000 - $15,000",
  "$15,000 - $50,000",
  "$50,000+",
] as const;

export type Sector = (typeof SECTORS)[number];
export type ServiceOption = (typeof SERVICE_OPTIONS)[number];
export type BudgetRange = (typeof BUDGET_RANGES)[number];

export interface BriefSubmissionInput {
  companyName: string;
  sector: Sector;
  objective: string;
  audience: string;
  neededServices: ServiceOption[];
  budgetRange: BudgetRange;
  deadline: string;
  aiMode: AiMode;
}

export interface BriefSummary {
  headline: string;
  keyPoints: string[];
  recommendedApproach: string;
  discoveryQuestions: string[];
}

export interface BriefCreateResponse {
  summary: BriefSummary;
  aiModeUsed: AiMode;
  fallbackApplied: boolean;
  fallbackReason?: "no_api_key" | "provider_error";
}

export interface StoredSubmission {
  id: number;
  createdAt: string;
  companyName: string;
  sector: string;
  objective: string;
  audience: string;
  neededServices: string[];
  budgetRange: string;
  deadline: string;
  summary: BriefSummary;
  aiModeUsed: AiMode;
  fallbackApplied: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    fieldErrors?: Record<string, string>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

import type { BriefFormValues, BriefSubmissionInput } from "../types/brief";

export const SECTOR_CUSTOM = "custom";
export const BUDGET_CUSTOM = "custom";

export function parseCustomServices(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function resolveBriefInput(
  values: BriefFormValues,
): BriefSubmissionInput {
  const sector =
    values.sectorPreset === SECTOR_CUSTOM
      ? values.sectorCustom.trim()
      : values.sectorPreset;

  const neededServices = [
    ...values.neededServices,
    ...parseCustomServices(values.customServices),
  ];

  const budgetRange =
    values.budgetPreset === BUDGET_CUSTOM
      ? values.customBudgetAmount.trim()
      : values.budgetPreset;

  return {
    companyName: values.companyName.trim(),
    sector,
    objective: values.objective.trim(),
    audience: values.audience.trim(),
    neededServices,
    budgetRange,
    deadline: values.deadline,
    aiMode: values.aiMode,
  };
}

export function validateBriefForm(
  values: BriefFormValues,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.companyName.trim()) {
    errors.companyName = "Company name is required";
  }
  if (!values.sectorPreset) {
    errors.sector = "Sector is required";
  } else if (
    values.sectorPreset === SECTOR_CUSTOM &&
    !values.sectorCustom.trim()
  ) {
    errors.sectorCustom = "Enter a custom sector";
  }
  if (!values.objective.trim()) {
    errors.objective = "Objective is required";
  }
  if (!values.audience.trim()) {
    errors.audience = "Audience is required";
  }

  const hasServices =
    values.neededServices.length > 0 || values.customServices.trim().length > 0;
  if (!hasServices) {
    errors.neededServices = "Select or enter at least one service";
  }

  if (!values.budgetPreset) {
    errors.budgetRange = "Budget is required";
  } else if (
    values.budgetPreset === BUDGET_CUSTOM &&
    !values.customBudgetAmount.trim()
  ) {
    errors.customBudgetAmount = "Enter a custom budget amount";
  }

  if (!values.deadline) {
    errors.deadline = "Deadline is required";
  }

  return errors;
}

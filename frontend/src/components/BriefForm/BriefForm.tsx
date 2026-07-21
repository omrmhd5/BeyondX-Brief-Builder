import { useState } from "react";
import {
  BUDGET_RANGES,
  SECTORS,
  SERVICE_OPTIONS,
  type BriefFormValues,
} from "../../types/brief";
import {
  BUDGET_CUSTOM,
  SECTOR_CUSTOM,
  validateBriefForm,
} from "../../lib/briefFormUtils";
import { INPUT, LABEL, MOTION } from "../../lib/uiClasses";
import AiModeToggle from "../AiModeToggle/AiModeToggle";
import BezelCard from "../ui/BezelCard";
import PrimaryButton from "../ui/PrimaryButton";
import SelectField from "../ui/SelectField";

export const defaultFormValues: BriefFormValues = {
  companyName: "",
  sectorPreset: "",
  sectorCustom: "",
  objective: "",
  audience: "",
  neededServices: [],
  customServices: "",
  budgetPreset: "",
  customBudgetAmount: "",
  deadline: "",
  aiMode: "mock",
};

interface BriefFormProps {
  values: BriefFormValues;
  onChange: (values: BriefFormValues) => void;
  onSubmit: () => void;
  disabled?: boolean;
  fieldErrors?: Record<string, string>;
  submitError?: string;
}

export default function BriefForm({
  values,
  onChange,
  onSubmit,
  disabled = false,
  fieldErrors = {},
  submitError,
}: BriefFormProps) {
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const errors = { ...clientErrors, ...fieldErrors };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateBriefForm(values);
    setClientErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit();
    }
  };

  const toggleService = (service: string) => {
    const next = values.neededServices.includes(service)
      ? values.neededServices.filter((s) => s !== service)
      : [...values.neededServices, service];
    onChange({ ...values, neededServices: next });
  };

  return (
    <BezelCard innerClassName="p-6 sm:p-8" revealDelay={100}>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Project Brief
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            All fields validated server-side before generation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="companyName" className={LABEL}>
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              value={values.companyName}
              onChange={(e) =>
                onChange({ ...values, companyName: e.target.value })
              }
              disabled={disabled}
              className={INPUT}
              aria-invalid={!!errors.companyName}
            />
            {errors.companyName && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.companyName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="sectorPreset" className={LABEL}>
              Sector
            </label>
            <SelectField
              id="sectorPreset"
              value={values.sectorPreset}
              onChange={(e) =>
                onChange({
                  ...values,
                  sectorPreset: e.target.value,
                  sectorCustom:
                    e.target.value === SECTOR_CUSTOM ? values.sectorCustom : "",
                })
              }
              disabled={disabled}
              hasError={!!errors.sector}
              aria-invalid={!!errors.sector}>
              <option value="">Select sector</option>
              {SECTORS.filter((s) => s !== "Other").map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value={SECTOR_CUSTOM}>Custom sector…</option>
            </SelectField>
            {errors.sector && (
              <p className="mt-1.5 text-xs text-red-400">{errors.sector}</p>
            )}
            {values.sectorPreset === SECTOR_CUSTOM && (
              <div className="mt-3">
                <label htmlFor="sectorCustom" className="sr-only">
                  Custom sector
                </label>
                <input
                  id="sectorCustom"
                  type="text"
                  placeholder="e.g. Hospitality, Logistics"
                  value={values.sectorCustom}
                  onChange={(e) =>
                    onChange({ ...values, sectorCustom: e.target.value })
                  }
                  disabled={disabled}
                  className={INPUT}
                  aria-invalid={!!errors.sectorCustom}
                />
                {errors.sectorCustom && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.sectorCustom}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="objective" className={LABEL}>
            Objective
          </label>
          <textarea
            id="objective"
            rows={3}
            value={values.objective}
            onChange={(e) => onChange({ ...values, objective: e.target.value })}
            disabled={disabled}
            className={INPUT}
            aria-invalid={!!errors.objective}
          />
          {errors.objective && (
            <p className="mt-1.5 text-xs text-red-400">{errors.objective}</p>
          )}
        </div>

        <div>
          <label htmlFor="audience" className={LABEL}>
            Target Audience
          </label>
          <input
            id="audience"
            type="text"
            value={values.audience}
            onChange={(e) => onChange({ ...values, audience: e.target.value })}
            disabled={disabled}
            className={INPUT}
            aria-invalid={!!errors.audience}
          />
          {errors.audience && (
            <p className="mt-1.5 text-xs text-red-400">{errors.audience}</p>
          )}
        </div>

        <fieldset>
          <legend className={LABEL}>Needed Services</legend>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_OPTIONS.map((service) => {
              const checked = values.neededServices.includes(service);
              return (
                <label
                  key={service}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm ${MOTION} ${
                    checked
                      ? "border-violet-400/30 bg-violet-500/10 text-violet-100"
                      : "border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04]"
                  }`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleService(service)}
                    disabled={disabled}
                    className="h-4 w-4 rounded border-white/20 bg-transparent text-violet-400 focus:ring-violet-400/30"
                  />
                  {service}
                </label>
              );
            })}
          </div>
          <div className="mt-4">
            <label htmlFor="customServices" className={LABEL}>
              Custom services
            </label>
            <input
              id="customServices"
              type="text"
              placeholder="e.g. Video Production, Consulting (comma-separated)"
              value={values.customServices}
              onChange={(e) =>
                onChange({ ...values, customServices: e.target.value })
              }
              disabled={disabled}
              className={INPUT}
              aria-invalid={!!errors.neededServices}
            />
            <p className="mt-1.5 text-xs text-zinc-600">
              Add your own services, separated by commas
            </p>
          </div>
          {errors.neededServices && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.neededServices}
            </p>
          )}
        </fieldset>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="budgetPreset" className={LABEL}>
              Budget Range
            </label>
            <SelectField
              id="budgetPreset"
              value={values.budgetPreset}
              onChange={(e) =>
                onChange({
                  ...values,
                  budgetPreset: e.target.value,
                  customBudgetAmount:
                    e.target.value === BUDGET_CUSTOM
                      ? values.customBudgetAmount
                      : "",
                })
              }
              disabled={disabled}
              hasError={!!errors.budgetRange}
              aria-invalid={!!errors.budgetRange}>
              <option value="">Select budget</option>
              {BUDGET_RANGES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option value={BUDGET_CUSTOM}>Custom amount…</option>
            </SelectField>
            {errors.budgetRange && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.budgetRange}
              </p>
            )}
            {values.budgetPreset === BUDGET_CUSTOM && (
              <div className="mt-3">
                <label htmlFor="customBudgetAmount" className="sr-only">
                  Custom budget amount
                </label>
                <input
                  id="customBudgetAmount"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. $25,000 or 25000 USD"
                  value={values.customBudgetAmount}
                  onChange={(e) =>
                    onChange({ ...values, customBudgetAmount: e.target.value })
                  }
                  disabled={disabled}
                  className={INPUT}
                  aria-invalid={!!errors.customBudgetAmount}
                />
                {errors.customBudgetAmount && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.customBudgetAmount}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="deadline" className={LABEL}>
              Desired Deadline
            </label>
            <input
              id="deadline"
              type="date"
              value={values.deadline}
              onChange={(e) =>
                onChange({ ...values, deadline: e.target.value })
              }
              disabled={disabled}
              className={INPUT}
              aria-invalid={!!errors.deadline}
            />
            {errors.deadline && (
              <p className="mt-1.5 text-xs text-red-400">{errors.deadline}</p>
            )}
          </div>
        </div>

        <AiModeToggle
          value={values.aiMode}
          onChange={(aiMode) => onChange({ ...values, aiMode })}
          disabled={disabled}
        />

        <PrimaryButton
          type="submit"
          disabled={disabled}
          fullWidth
          className="sm:w-auto">
          Generate Brief
        </PrimaryButton>

        {(Object.keys(errors).length > 0 || submitError) && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-2xl border border-red-400/20 bg-red-500/5 px-4 py-3">
            {submitError && (
              <p className="text-sm font-medium text-red-300">{submitError}</p>
            )}
            {Object.keys(errors).length > 0 && (
              <ul
                className={`space-y-1 text-sm text-red-300/90 ${submitError ? "mt-2" : ""}`}>
                {Object.entries(errors).map(([field, err]) => (
                  <li key={field}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </form>
    </BezelCard>
  );
}

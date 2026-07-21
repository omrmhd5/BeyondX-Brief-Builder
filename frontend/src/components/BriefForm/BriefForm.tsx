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
import AiModeToggle from "../AiModeToggle/AiModeToggle";

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
}

const inputClass =
  "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500";

export default function BriefForm({
  values,
  onChange,
  onSubmit,
  disabled = false,
  fieldErrors = {},
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
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      noValidate>
      <h2 className="text-lg font-semibold text-slate-900">Project Brief</h2>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="companyName"
            className="block text-sm font-medium text-slate-700">
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
            className={inputClass}
            aria-invalid={!!errors.companyName}
          />
          {errors.companyName && (
            <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="sectorPreset"
            className="block text-sm font-medium text-slate-700">
            Sector
          </label>
          <select
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
            className={inputClass}
            aria-invalid={!!errors.sector}>
            <option value="">Select sector</option>
            {SECTORS.filter((s) => s !== "Other").map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value={SECTOR_CUSTOM}>Custom sector…</option>
          </select>
          {errors.sector && (
            <p className="mt-1 text-xs text-red-600">{errors.sector}</p>
          )}
          {values.sectorPreset === SECTOR_CUSTOM && (
            <div className="mt-2">
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
                className={inputClass}
                aria-invalid={!!errors.sectorCustom}
              />
              {errors.sectorCustom && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.sectorCustom}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="objective"
          className="block text-sm font-medium text-slate-700">
          Objective
        </label>
        <textarea
          id="objective"
          rows={3}
          value={values.objective}
          onChange={(e) => onChange({ ...values, objective: e.target.value })}
          disabled={disabled}
          className={inputClass}
          aria-invalid={!!errors.objective}
        />
        {errors.objective && (
          <p className="mt-1 text-xs text-red-600">{errors.objective}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="audience"
          className="block text-sm font-medium text-slate-700">
          Target Audience
        </label>
        <input
          id="audience"
          type="text"
          value={values.audience}
          onChange={(e) => onChange({ ...values, audience: e.target.value })}
          disabled={disabled}
          className={inputClass}
          aria-invalid={!!errors.audience}
        />
        {errors.audience && (
          <p className="mt-1 text-xs text-red-600">{errors.audience}</p>
        )}
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">
          Needed Services
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SERVICE_OPTIONS.map((service) => (
            <label
              key={service}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
              <input
                type="checkbox"
                checked={values.neededServices.includes(service)}
                onChange={() => toggleService(service)}
                disabled={disabled}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              {service}
            </label>
          ))}
        </div>
        <div className="mt-3">
          <label
            htmlFor="customServices"
            className="block text-sm font-medium text-slate-700">
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
            className={inputClass}
            aria-invalid={!!errors.neededServices}
          />
          <p className="mt-1 text-xs text-slate-500">
            Add your own services, separated by commas
          </p>
        </div>
        {errors.neededServices && (
          <p className="mt-1 text-xs text-red-600">{errors.neededServices}</p>
        )}
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="budgetPreset"
            className="block text-sm font-medium text-slate-700">
            Budget Range
          </label>
          <select
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
            className={inputClass}
            aria-invalid={!!errors.budgetRange}>
            <option value="">Select budget</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
            <option value={BUDGET_CUSTOM}>Custom amount…</option>
          </select>
          {errors.budgetRange && (
            <p className="mt-1 text-xs text-red-600">{errors.budgetRange}</p>
          )}
          {values.budgetPreset === BUDGET_CUSTOM && (
            <div className="mt-2">
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
                className={inputClass}
                aria-invalid={!!errors.customBudgetAmount}
              />
              {errors.customBudgetAmount && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.customBudgetAmount}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="deadline"
            className="block text-sm font-medium text-slate-700">
            Desired Deadline
          </label>
          <input
            id="deadline"
            type="date"
            value={values.deadline}
            onChange={(e) => onChange({ ...values, deadline: e.target.value })}
            disabled={disabled}
            className={inputClass}
            aria-invalid={!!errors.deadline}
          />
          {errors.deadline && (
            <p className="mt-1 text-xs text-red-600">{errors.deadline}</p>
          )}
        </div>
      </div>

      <AiModeToggle
        value={values.aiMode}
        onChange={(aiMode) => onChange({ ...values, aiMode })}
        disabled={disabled}
      />

      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300 sm:w-auto">
        Generate Brief
      </button>
    </form>
  );
}

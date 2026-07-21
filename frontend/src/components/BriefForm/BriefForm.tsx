import { useState } from "react";
import {
  BUDGET_RANGES,
  SECTORS,
  SERVICE_OPTIONS,
  type BriefFormValues,
  type ServiceOption,
} from "../../types/brief";
import AiModeToggle from "../AiModeToggle/AiModeToggle";

export const defaultFormValues: BriefFormValues = {
  companyName: "",
  sector: "",
  objective: "",
  audience: "",
  neededServices: [],
  budgetRange: "",
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

function validateClient(values: BriefFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.companyName.trim())
    errors.companyName = "Company name is required";
  if (!values.sector) errors.sector = "Sector is required";
  if (!values.objective.trim()) errors.objective = "Objective is required";
  if (!values.audience.trim()) errors.audience = "Audience is required";
  if (values.neededServices.length === 0)
    errors.neededServices = "Select at least one service";
  if (!values.budgetRange) errors.budgetRange = "Budget range is required";
  if (!values.deadline) errors.deadline = "Deadline is required";
  return errors;
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
    const errs = validateClient(values);
    setClientErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit();
    }
  };

  const toggleService = (service: ServiceOption) => {
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
            aria-describedby={
              errors.companyName ? "companyName-error" : undefined
            }
          />
          {errors.companyName && (
            <p id="companyName-error" className="mt-1 text-xs text-red-600">
              {errors.companyName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="sector"
            className="block text-sm font-medium text-slate-700">
            Sector
          </label>
          <select
            id="sector"
            value={values.sector}
            onChange={(e) =>
              onChange({
                ...values,
                sector: e.target.value as BriefFormValues["sector"],
              })
            }
            disabled={disabled}
            className={inputClass}
            aria-invalid={!!errors.sector}>
            <option value="">Select sector</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.sector && (
            <p className="mt-1 text-xs text-red-600">{errors.sector}</p>
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
        {errors.neededServices && (
          <p className="mt-1 text-xs text-red-600">{errors.neededServices}</p>
        )}
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="budgetRange"
            className="block text-sm font-medium text-slate-700">
            Budget Range
          </label>
          <select
            id="budgetRange"
            value={values.budgetRange}
            onChange={(e) =>
              onChange({
                ...values,
                budgetRange: e.target.value as BriefFormValues["budgetRange"],
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
          </select>
          {errors.budgetRange && (
            <p className="mt-1 text-xs text-red-600">{errors.budgetRange}</p>
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

import type { AiMode } from "../types/brief";

interface AiModeToggleProps {
  value: AiMode;
  onChange: (mode: AiMode) => void;
  disabled?: boolean;
}

export default function AiModeToggle({
  value,
  onChange,
  disabled = false,
}: AiModeToggleProps) {
  return (
    <fieldset className="rounded-lg border border-slate-200 bg-white p-4">
      <legend className="px-1 text-sm font-medium text-slate-700">
        AI Mode
      </legend>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="aiMode"
            value="mock"
            checked={value === "mock"}
            onChange={() => onChange("mock")}
            disabled={disabled}
            className="h-4 w-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-700">
            Mock (deterministic, no API key)
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="aiMode"
            value="real"
            checked={value === "real"}
            onChange={() => onChange("real")}
            disabled={disabled}
            className="h-4 w-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-700">Real AI (Gemini)</span>
        </label>
      </div>
    </fieldset>
  );
}

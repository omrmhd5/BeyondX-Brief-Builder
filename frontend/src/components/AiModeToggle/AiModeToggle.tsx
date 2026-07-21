import type { AiMode } from "../../types/brief";
import { MOTION } from "../../lib/uiClasses";

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
    <fieldset className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <legend className="px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">
        AI Mode
      </legend>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
        {(
          [
            {
              mode: "mock" as const,
              label: "Mock",
              hint: "Deterministic, no API key",
            },
            {
              mode: "real" as const,
              label: "Real AI",
              hint: "Gemini with safe fallback",
            },
          ] as const
        ).map(({ mode, label, hint }) => {
          const active = value === mode;
          return (
            <label
              key={mode}
              className={`flex flex-1 cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 ${MOTION} ${
                active
                  ? "border-violet-400/30 bg-violet-500/10"
                  : "border-white/10 bg-transparent hover:bg-white/[0.03]"
              }`}>
              <input
                type="radio"
                name="aiMode"
                value={mode}
                checked={active}
                onChange={() => onChange(mode)}
                disabled={disabled}
                className="mt-0.5 h-4 w-4 border-white/20 bg-transparent text-violet-400 focus:ring-violet-400/30"
              />
              <span>
                <span className="block text-sm font-medium text-zinc-200">
                  {label}
                </span>
                <span className="block text-xs text-zinc-500">{hint}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

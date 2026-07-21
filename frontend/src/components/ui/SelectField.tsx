import type { SelectHTMLAttributes } from "react";
import { MOTION, SELECT } from "../../lib/uiClasses";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export default function SelectField({
  className = "",
  hasError = false,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <div className="relative mt-2">
      <select
        className={`${SELECT} ${MOTION} ${
          hasError ? "border-red-400/40 focus:ring-red-400/20" : ""
        } ${className}`}
        {...props}>
        {children}
      </select>
      <span
        className="pointer-events-none absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400"
        aria-hidden="true">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="text-current">
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

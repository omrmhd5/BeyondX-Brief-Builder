import type { ButtonHTMLAttributes, ReactNode } from "react";
import { MOTION } from "../../lib/uiClasses";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  showArrow?: boolean;
  fullWidth?: boolean;
}

export default function PrimaryButton({
  children,
  showArrow = true,
  fullWidth = false,
  className = "",
  disabled,
  type,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type ?? "button"}
      disabled={disabled}
      className={`group inline-flex cursor-pointer items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#050505] ${MOTION} hover:bg-zinc-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-400/40 disabled:cursor-not-allowed disabled:opacity-40 ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}>
      <span>{children}</span>
      {showArrow && (
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 ${MOTION} group-hover:translate-x-1 group-hover:-translate-y-px group-hover:scale-105`}
          aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="text-[#050505]">
            <path
              d="M3 11L11 3M11 3H5M11 3V9"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </button>
  );
}

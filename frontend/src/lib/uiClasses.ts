/** Shared design tokens — Ethereal Glass / agency-tier UI */

export const MOTION =
  "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]";

export const BEZEL_OUTER =
  "rounded-[2rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10";

export const BEZEL_INNER =
  "rounded-[calc(2rem-0.375rem)] bg-[#0a0a0c] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]";

export const LABEL =
  "block text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400";

export const INPUT =
  "mt-2 block w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus:border-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-400/20 disabled:cursor-not-allowed disabled:opacity-50";

export const SCROLLBAR = "scrollbar-premium";

export const EYEBROW =
  "inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400";

export const BADGE =
  "inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400";

export const GHOST_BTN =
  "cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-400/30 disabled:cursor-not-allowed disabled:opacity-40";

export const DANGER_BTN =
  "cursor-pointer rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/30 disabled:cursor-not-allowed disabled:opacity-40";

export const SELECT =
  "block w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] px-4 py-2.5 pr-14 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/20 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] focus:border-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-400/20 disabled:cursor-not-allowed disabled:opacity-50";

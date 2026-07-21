import type { BriefCreateResponse } from "../../types/brief";
import { BADGE } from "../../lib/uiClasses";
import BezelCard from "../ui/BezelCard";

interface BriefSummaryResultProps {
  result: BriefCreateResponse;
  embedded?: boolean;
  revealDelay?: number;
}

export default function BriefSummaryResult({
  result,
  embedded = false,
  revealDelay = 0,
}: BriefSummaryResultProps) {
  const { summary, aiModeUsed, fallbackApplied } = result;

  const content = (
    <section aria-labelledby="brief-summary-heading" className="p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <h2
          id="brief-summary-heading"
          className="text-lg font-semibold tracking-tight text-white">
          Brief Summary
        </h2>
        <span className={BADGE}>
          {aiModeUsed === "real" ? "Real AI" : "Mock"}
        </span>
        {fallbackApplied && (
          <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300">
            Fallback applied
          </span>
        )}
      </div>

      <h3 className="text-2xl font-bold tracking-tight text-white">
        {summary.headline}
      </h3>

      <div className="mt-6">
        <h4 className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
          Key Points
        </h4>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-300">
          {summary.keyPoints.map((point, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h4 className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
          Recommended Approach
        </h4>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          {summary.recommendedApproach}
        </p>
      </div>
    </section>
  );

  if (embedded) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
        {content}
      </div>
    );
  }

  return (
    <BezelCard revealDelay={revealDelay} innerClassName="">
      {content}
    </BezelCard>
  );
}

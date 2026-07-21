import type { BriefCreateResponse } from "../../types/brief";

interface BriefSummaryResultProps {
  result: BriefCreateResponse;
}

export default function BriefSummaryResult({
  result,
}: BriefSummaryResultProps) {
  const { summary, aiModeUsed, fallbackApplied } = result;

  return (
    <section
      className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm"
      aria-labelledby="brief-summary-heading">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2
          id="brief-summary-heading"
          className="text-lg font-semibold text-slate-900">
          Brief Summary
        </h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {aiModeUsed === "real" ? "Real AI" : "Mock"}
        </span>
        {fallbackApplied && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Real AI unavailable — showing mock result
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-indigo-900">{summary.headline}</h3>

      <div className="mt-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Key Points
        </h4>
        <ul className="mt-2 list-inside list-disc space-y-1 text-slate-700">
          {summary.keyPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recommended Approach
        </h4>
        <p className="mt-2 text-slate-700">{summary.recommendedApproach}</p>
      </div>
    </section>
  );
}

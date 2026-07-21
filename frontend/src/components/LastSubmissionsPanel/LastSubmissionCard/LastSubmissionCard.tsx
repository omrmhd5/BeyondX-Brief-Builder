import type { StoredSubmission } from "../../types/brief";

interface LastSubmissionCardProps {
  submission: StoredSubmission;
}

export default function LastSubmissionCard({
  submission,
}: LastSubmissionCardProps) {
  const date = new Date(submission.createdAt).toLocaleString();

  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">
          {submission.companyName}
        </h3>
        <span className="text-xs text-slate-500">{date}</span>
      </div>
      <p className="mt-1 text-sm text-slate-600 line-clamp-2">
        {submission.summary.headline}
      </p>
      <div className="mt-2 flex gap-2">
        <span className="rounded bg-white px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200">
          {submission.aiModeUsed === "real" ? "Real AI" : "Mock"}
        </span>
        {submission.fallbackApplied && (
          <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700 ring-1 ring-amber-200">
            Fallback
          </span>
        )}
      </div>
    </article>
  );
}

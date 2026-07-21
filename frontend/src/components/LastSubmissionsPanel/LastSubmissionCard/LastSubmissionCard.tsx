import type { StoredSubmission } from "../../../types/brief";

interface LastSubmissionCardProps {
  submission: StoredSubmission;
  onView: (submission: StoredSubmission) => void;
  onDelete: (id: number) => void;
  deleting?: boolean;
}

export default function LastSubmissionCard({
  submission,
  onView,
  onDelete,
  deleting = false,
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
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded bg-white px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200">
          {submission.aiModeUsed === "real" ? "Real AI" : "Mock"}
        </span>
        {submission.fallbackApplied && (
          <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700 ring-1 ring-amber-200">
            Fallback
          </span>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onView(submission)}
          disabled={deleting}
          className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50">
          View
        </button>
        <button
          type="button"
          onClick={() => onDelete(submission.id)}
          disabled={deleting}
          className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50">
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </article>
  );
}

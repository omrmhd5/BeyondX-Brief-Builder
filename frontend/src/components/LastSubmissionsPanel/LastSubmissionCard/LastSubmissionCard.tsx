import type { StoredSubmission } from "../../../types/brief";
import { BADGE, DANGER_BTN, GHOST_BTN } from "../../../lib/uiClasses";

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
    <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-zinc-100">
          {submission.companyName}
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-zinc-600">
          {date}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
        {submission.summary.headline}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={BADGE}>
          {submission.aiModeUsed === "real" ? "Real AI" : "Mock"}
        </span>
        {submission.fallbackApplied && (
          <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300">
            Fallback
          </span>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onView(submission)}
          disabled={deleting}
          className={GHOST_BTN}>
          View
        </button>
        <button
          type="button"
          onClick={() => onDelete(submission.id)}
          disabled={deleting}
          className={DANGER_BTN}>
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </article>
  );
}

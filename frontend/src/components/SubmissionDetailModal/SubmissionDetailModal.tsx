import BriefSummaryResult from "../BriefSummaryResult/BriefSummaryResult";
import DiscoveryQuestionsList from "../DiscoveryQuestionsList/DiscoveryQuestionsList";
import type { StoredSubmission } from "../../types/brief";
import {
  BEZEL_INNER,
  BEZEL_OUTER,
  GHOST_BTN,
  MOTION,
} from "../../lib/uiClasses";

interface SubmissionDetailModalProps {
  submission: StoredSubmission;
  onClose: () => void;
}

export default function SubmissionDetailModal({
  submission,
  onClose,
}: SubmissionDetailModalProps) {
  const date = new Date(submission.createdAt).toLocaleString();

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-3xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-detail-title"
      onClick={onClose}>
      <div
        className={`scrollbar-premium max-h-[90vh] w-full max-w-2xl overflow-y-auto ${BEZEL_OUTER} ${MOTION}`}
        onClick={(e) => e.stopPropagation()}>
        <div className={`${BEZEL_INNER} p-6 sm:p-8`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="submission-detail-title"
                className="text-2xl font-bold tracking-tight text-white">
                {submission.companyName}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{date}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={GHOST_BTN}
              aria-label="Close">
              Close
            </button>
          </div>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            {(
              [
                ["Sector", submission.sector],
                ["Budget", submission.budgetRange],
                ["Deadline", submission.deadline],
                ["Services", submission.neededServices.join(", ")],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  {label}
                </dt>
                <dd className="mt-1 text-zinc-200">{value}</dd>
              </div>
            ))}
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Objective
              </dt>
              <dd className="mt-1 text-zinc-200">{submission.objective}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Audience
              </dt>
              <dd className="mt-1 text-zinc-200">{submission.audience}</dd>
            </div>
          </dl>

          <div className="mt-8 space-y-6">
            <BriefSummaryResult
              embedded
              result={{
                summary: submission.summary,
                aiModeUsed: submission.aiModeUsed,
                fallbackApplied: submission.fallbackApplied,
              }}
            />
            <DiscoveryQuestionsList
              embedded
              questions={submission.summary.discoveryQuestions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

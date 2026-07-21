import BriefSummaryResult from "../BriefSummaryResult/BriefSummaryResult";
import DiscoveryQuestionsList from "../DiscoveryQuestionsList/DiscoveryQuestionsList";
import type { StoredSubmission } from "../../../types/brief";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-detail-title"
      onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="submission-detail-title"
              className="text-xl font-bold text-slate-900">
              {submission.companyName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{date}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close">
            Close
          </button>
        </div>

        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">Sector</dt>
            <dd className="text-slate-800">{submission.sector}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Budget</dt>
            <dd className="text-slate-800">{submission.budgetRange}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Deadline</dt>
            <dd className="text-slate-800">{submission.deadline}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Services</dt>
            <dd className="text-slate-800">
              {submission.neededServices.join(", ")}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-medium text-slate-500">Objective</dt>
            <dd className="text-slate-800">{submission.objective}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-medium text-slate-500">Audience</dt>
            <dd className="text-slate-800">{submission.audience}</dd>
          </div>
        </dl>

        <div className="mt-6 space-y-6">
          <BriefSummaryResult
            result={{
              summary: submission.summary,
              aiModeUsed: submission.aiModeUsed,
              fallbackApplied: submission.fallbackApplied,
            }}
          />
          <DiscoveryQuestionsList
            questions={submission.summary.discoveryQuestions}
          />
        </div>
      </div>
    </div>
  );
}

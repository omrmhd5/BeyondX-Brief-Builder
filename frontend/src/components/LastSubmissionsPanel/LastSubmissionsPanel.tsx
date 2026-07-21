import { useCallback, useEffect, useState } from "react";
import {
  deleteAllBriefs,
  deleteBrief,
  fetchRecentBriefs,
  isApiError,
} from "../../api/briefsApi";
import { track } from "../../lib/analytics";
import type { StoredSubmission } from "../../types/brief";
import ConfirmDeleteModal from "../ConfirmDeleteModal/ConfirmDeleteModal";
import SubmissionDetailModal from "../SubmissionDetailModal/SubmissionDetailModal";
import LastSubmissionCard from "./LastSubmissionCard/LastSubmissionCard";

interface LastSubmissionsPanelProps {
  refreshKey?: number;
}

type ConfirmState =
  | { type: "one"; id: number; companyName: string }
  | { type: "all" }
  | null;

export default function LastSubmissionsPanel({
  refreshKey = 0,
}: LastSubmissionsPanelProps) {
  const [submissions, setSubmissions] = useState<StoredSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<StoredSubmission | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRecentBriefs();
      if (isApiError(res)) {
        setError(res.error.message);
        return;
      }
      setSubmissions(res.data);
    } catch {
      setError("Could not load recent submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setError(null);
    try {
      const res = await deleteBrief(id);
      if (isApiError(res)) {
        setError(res.error.message);
        return;
      }
      track("brief_deleted", { id });
      if (viewing?.id === id) setViewing(null);
      setConfirm(null);
      await load();
    } catch {
      setError("Could not delete submission.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    setError(null);
    try {
      const res = await deleteAllBriefs();
      if (isApiError(res)) {
        setError(res.error.message);
        return;
      }
      track("briefs_deleted_all", { count: res.data.deletedCount });
      setViewing(null);
      setConfirm(null);
      await load();
    } catch {
      setError("Could not delete submissions.");
    } finally {
      setDeletingAll(false);
    }
  };

  const isBusy = deletingId !== null || deletingAll;

  const confirmTitle =
    confirm?.type === "all" ? "Delete all submissions?" : "Delete submission?";

  const confirmMessage =
    confirm?.type === "all"
      ? "This will permanently remove all stored briefs. This action cannot be undone."
      : confirm?.type === "one"
        ? `This will permanently remove the brief for "${confirm.companyName}". This action cannot be undone.`
        : "";

  return (
    <>
      <section
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        aria-labelledby="recent-submissions-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="recent-submissions-heading"
              className="text-lg font-semibold text-slate-900">
              Past Submissions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Last 5 briefs (newest first)
            </p>
          </div>
          {submissions.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirm({ type: "all" })}
              disabled={isBusy || loading}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50">
              Delete all
            </button>
          )}
        </div>

        {loading && (
          <p className="mt-4 text-sm text-slate-500" aria-live="polite">
            Loading…
          </p>
        )}
        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && submissions.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">
            No submissions yet. Submit a brief to see it here.
          </p>
        )}
        <div className="mt-4 space-y-3">
          {submissions.map((s) => (
            <LastSubmissionCard
              key={s.id}
              submission={s}
              onView={setViewing}
              onDelete={(id) =>
                setConfirm({
                  type: "one",
                  id,
                  companyName: s.companyName,
                })
              }
              deleting={deletingId === s.id || deletingAll}
            />
          ))}
        </div>
      </section>

      {viewing && (
        <SubmissionDetailModal
          submission={viewing}
          onClose={() => setViewing(null)}
        />
      )}

      <ConfirmDeleteModal
        isOpen={confirm !== null}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirm?.type === "all" ? "Delete all" : "Delete"}
        loading={isBusy}
        onCancel={() => !isBusy && setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === "one") void handleDelete(confirm.id);
          else if (confirm?.type === "all") void handleDeleteAll();
        }}
      />
    </>
  );
}

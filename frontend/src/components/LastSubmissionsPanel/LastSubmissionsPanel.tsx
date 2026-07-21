import { useCallback, useEffect, useState } from "react";
import { fetchRecentBriefs, isApiError } from "../../api/briefsApi";
import type { StoredSubmission } from "../../types/brief";
import LastSubmissionCard from "./LastSubmissionCard/LastSubmissionCard";

interface LastSubmissionsPanelProps {
  refreshKey?: number;
}

export default function LastSubmissionsPanel({
  refreshKey = 0,
}: LastSubmissionsPanelProps) {
  const [submissions, setSubmissions] = useState<StoredSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="recent-submissions-heading">
      <h2
        id="recent-submissions-heading"
        className="text-lg font-semibold text-slate-900">
        Recent Submissions
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Last 5 briefs (newest first)
      </p>

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
          <LastSubmissionCard key={s.id} submission={s} />
        ))}
      </div>
    </section>
  );
}

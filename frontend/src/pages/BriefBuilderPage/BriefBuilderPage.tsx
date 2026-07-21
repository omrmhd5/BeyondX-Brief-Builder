import { useEffect, useState } from "react";
import { track } from "../../lib/analytics";
import BriefForm, {
  defaultFormValues,
} from "../../components/BriefForm/BriefForm";
import BriefSummaryResult from "../../components/BriefSummaryResult/BriefSummaryResult";
import DiscoveryQuestionsList from "../../components/DiscoveryQuestionsList/DiscoveryQuestionsList";
import ErrorBanner from "../../components/ErrorBanner/ErrorBanner";
import LastSubmissionsPanel from "../../components/LastSubmissionsPanel/LastSubmissionsPanel";
import LoadingState from "../../components/LoadingState/LoadingState";
import { useBriefSubmission } from "../../hooks/useBriefSubmission";
import type { BriefFormValues } from "../../types/brief";

export default function BriefBuilderPage() {
  const [formValues, setFormValues] =
    useState<BriefFormValues>(defaultFormValues);
  const { state, submit, refreshKey } = useBriefSubmission();
  const isLoading = state.status === "loading";

  useEffect(() => {
    if (state.status === "success" && state.result) {
      track("discovery_questions_viewed", {
        count: state.result.summary.discoveryQuestions.length,
      });
    }
  }, [state.status, state.result]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold text-indigo-900 sm:text-3xl">
            Beyond X Brief Builder
          </h1>
          <p className="mt-1 text-sm text-slate-600 sm:text-base">
            Enter your project details and receive a structured brief summary
            with discovery questions.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <BriefForm
              values={formValues}
              onChange={setFormValues}
              onSubmit={() => void submit(formValues)}
              disabled={isLoading}
              fieldErrors={state.fieldErrors}
            />
          </div>

          <div className="lg:col-span-2">
            <LastSubmissionsPanel refreshKey={refreshKey} />
          </div>
        </div>

        {isLoading && <LoadingState />}

        {state.status === "error" && (
          <ErrorBanner
            message={state.errorMessage}
            fieldErrors={state.fieldErrors}
          />
        )}

        {state.status === "success" && state.result && (
          <div className="space-y-6">
            <BriefSummaryResult result={state.result} />
            <DiscoveryQuestionsList
              questions={state.result.summary.discoveryQuestions}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        Beyond X Brief Builder — Assessment Prototype
      </footer>
    </div>
  );
}

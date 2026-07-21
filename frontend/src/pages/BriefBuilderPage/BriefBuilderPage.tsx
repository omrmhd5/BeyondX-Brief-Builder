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
import Eyebrow from "../../components/ui/Eyebrow";
import { useBriefSubmission } from "../../hooks/useBriefSubmission";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { MOTION } from "../../lib/uiClasses";
import type { BriefFormValues } from "../../types/brief";

export default function BriefBuilderPage() {
  const [formValues, setFormValues] =
    useState<BriefFormValues>(defaultFormValues);
  const { state, submit, refreshKey } = useBriefSubmission();
  const isLoading = state.status === "loading";
  const { ref: heroRef, visible: heroVisible } =
    useScrollReveal<HTMLDivElement>();

  useEffect(() => {
    if (state.status === "success" && state.result) {
      track("discovery_questions_viewed", {
        count: state.result.summary.discoveryQuestions.length,
      });
    }
  }, [state.status, state.result]);

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true">
        <div className="absolute left-1/4 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] translate-x-1/4 rounded-full bg-emerald-500/15 blur-[100px]" />
      </div>

      <div ref={heroRef}>
        <header className="px-4 pt-6 sm:px-6">
          <div
            className={`mx-auto flex w-full max-w-4xl flex-col items-center gap-4 rounded-full border border-white/10 bg-white/[0.04] px-6 py-4 text-center backdrop-blur-2xl sm:flex-row sm:justify-between sm:text-left ${MOTION} ${heroVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                Beyond X
              </p>
              <p className="text-sm font-semibold text-zinc-100">
                Brief Builder
              </p>
            </div>
            <p className="max-w-md text-xs text-zinc-500">
              AI-assisted client briefs with discovery questions
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <section
            className={`mb-16 max-w-3xl ${MOTION} ${heroVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            style={{ transitionDelay: "80ms" }}>
            <Eyebrow>Client intake</Eyebrow>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Turn project details into a{" "}
              <span className="bg-gradient-to-r from-violet-300 to-emerald-300 bg-clip-text text-transparent">
                structured brief
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
              Enter company context, objectives, and constraints — receive a
              polished summary plus 4–6 discovery questions to guide your next
              conversation.
            </p>
          </section>

          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <BriefForm
                values={formValues}
                onChange={setFormValues}
                onSubmit={() => void submit(formValues)}
                disabled={isLoading}
                fieldErrors={state.fieldErrors}
                submitError={
                  state.status === "error" ? state.errorMessage : undefined
                }
              />
            </div>

            <div className="lg:col-span-4">
              <LastSubmissionsPanel refreshKey={refreshKey} />
            </div>
          </div>

          <div className="mt-10 space-y-8">
            {isLoading && <LoadingState />}

            {state.status === "error" && (
              <ErrorBanner
                message={state.errorMessage}
                fieldErrors={state.fieldErrors}
              />
            )}

            {state.status === "success" && state.result && (
              <div className="grid gap-8 lg:grid-cols-2">
                <BriefSummaryResult result={state.result} revealDelay={0} />
                <DiscoveryQuestionsList
                  questions={state.result.summary.discoveryQuestions}
                  revealDelay={120}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="border-t border-white/5 py-8 text-center text-[11px] uppercase tracking-[0.16em] text-zinc-600">
        Beyond X Brief Builder — Assessment Prototype
      </footer>
    </div>
  );
}

import { useCallback, useState } from "react";
import { isApiError, NetworkError, submitBrief } from "../api/briefsApi";
import { resolveBriefInput } from "../lib/briefFormUtils";
import { track } from "../lib/analytics";
import type { BriefCreateResponse, BriefFormValues } from "../types/brief";

export type SubmissionStatus =
  | "idle"
  | "validating"
  | "loading"
  | "success"
  | "error";

interface SubmissionState {
  status: SubmissionStatus;
  result?: BriefCreateResponse;
  errorMessage?: string;
  fieldErrors?: Record<string, string>;
}

export function useBriefSubmission() {
  const [state, setState] = useState<SubmissionState>({ status: "idle" });
  const [refreshKey, setRefreshKey] = useState(0);

  const submit = useCallback(async (values: BriefFormValues) => {
    setState({ status: "loading" });
    track("brief_submitted", { aiMode: values.aiMode });

    const input = resolveBriefInput(values);

    try {
      const res = await submitBrief(input);

      if (isApiError(res)) {
        track("brief_validation_failed", {
          fieldErrors: res.error.fieldErrors,
        });
        setState({
          status: "error",
          errorMessage: res.error.message,
          fieldErrors: res.error.fieldErrors,
        });
        return;
      }

      track("ai_provider_used", {
        mode: res.data.aiModeUsed,
        fallback: res.data.fallbackApplied,
      });
      if (res.data.fallbackApplied) {
        track("ai_provider_fallback", {
          reason: res.data.fallbackReason,
        });
      }

      setState({ status: "success", result: res.data });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const message =
        err instanceof NetworkError
          ? err.message
          : "Something went wrong. Please try again.";
      setState({ status: "error", errorMessage: message });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset, refreshKey };
}

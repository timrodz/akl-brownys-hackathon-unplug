"use client";

import { useSyncExternalStore } from "react";
import type { SubmissionSuccessResponse } from "@/lib/submissions/types";

/** Session storage key for the latest submission results (shared by home and /results). */
export const RESULTS_STORAGE_KEY = "unplug-live-results";

function parseStoredResults(): SubmissionSuccessResponse | null {
  try {
    const raw = sessionStorage.getItem(RESULTS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SubmissionSuccessResponse;
    if (
      parsed &&
      typeof parsed.submissionId === "string" &&
      Array.isArray(parsed.recommendations)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function subscribeToResultsStorage(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === RESULTS_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export function useStoredSubmissionResults(): {
  result: SubmissionSuccessResponse | null;
  hydrated: boolean;
} {
  const result = useSyncExternalStore(subscribeToResultsStorage, parseStoredResults, () => null);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return { result, hydrated };
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreatePsychologyEntryInput } from "@trading-os/shared-types";
import { listPsychologyEntriesAction, createPsychologyEntryAction, getBehavioralAnalyticsAction } from "../lib/actions";

export function usePsychologyEntries() {
  return useQuery({ queryKey: ["psychology-entries"], queryFn: listPsychologyEntriesAction });
}

export function useCreatePsychologyEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePsychologyEntryInput) => createPsychologyEntryAction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psychology-entries"] });
      queryClient.invalidateQueries({ queryKey: ["behavioral-analytics"] });
    },
  });
}

export function useBehavioralAnalytics() {
  return useQuery({ queryKey: ["behavioral-analytics"], queryFn: getBehavioralAnalyticsAction });
}

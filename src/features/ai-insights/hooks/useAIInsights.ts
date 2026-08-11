"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  generateTradeReviewAction,
  detectMistakePatternsAction,
  gradeSetupAction,
  summarizeJournalAction,
  listRecentTradesForReviewAction,
  listStrategiesForGradingAction,
} from "../lib/actions";

export function useRecentTradesForReview() {
  return useQuery({ queryKey: ["ai-recent-trades"], queryFn: listRecentTradesForReviewAction });
}

export function useStrategiesForGrading() {
  return useQuery({ queryKey: ["ai-strategies"], queryFn: listStrategiesForGradingAction });
}

export function useGenerateTradeReview() {
  return useMutation({ mutationFn: (tradeId: string) => generateTradeReviewAction(tradeId) });
}

export function useDetectMistakePatterns() {
  return useMutation({ mutationFn: () => detectMistakePatternsAction() });
}

export function useGradeSetup() {
  return useMutation({ mutationFn: (strategyId: string) => gradeSetupAction(strategyId) });
}

export function useSummarizeJournal() {
  return useMutation({
    mutationFn: ({ periodLabel, sinceDaysAgo }: { periodLabel: string; sinceDaysAgo: number }) =>
      summarizeJournalAction(periodLabel, sinceDaysAgo),
  });
}

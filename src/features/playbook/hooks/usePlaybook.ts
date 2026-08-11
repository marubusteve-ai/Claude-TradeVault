"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateStrategyInput } from "@trading-os/shared-types";
import {
  listStrategiesAction,
  createStrategyAction,
  updateStrategyAction,
  deleteStrategyAction,
  getStrategyPerformanceAction,
  createSetupAction,
} from "../lib/actions";

export function useStrategies() {
  return useQuery({ queryKey: ["strategies"], queryFn: listStrategiesAction });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStrategyInput) => createStrategyAction(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["strategies"] }),
  });
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateStrategyInput> }) => updateStrategyAction(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["strategies"] }),
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStrategyAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["strategies"] }),
  });
}

export function useStrategyPerformance(strategyId: string) {
  return useQuery({ queryKey: ["strategy-performance", strategyId], queryFn: () => getStrategyPerformanceAction(strategyId) });
}

export function useCreateSetup(strategyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStrategyInput & { strategyId: string }) => createSetupAction(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["strategy-performance", strategyId] }),
  });
}

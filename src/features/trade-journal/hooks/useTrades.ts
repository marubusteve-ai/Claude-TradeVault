"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateTradeInput } from "@trading-os/shared-types";
import { createTradeAction, createManyTradesAction, updateTradeAction, deleteTradeAction, listTradesAction } from "../lib/actions";

const tradesQueryKey = (accountId: string) => ["trades", accountId] as const;

export function useTrades(accountId: string) {
  return useQuery({
    queryKey: tradesQueryKey(accountId),
    queryFn: () => listTradesAction(accountId),
  });
}

export function useCreateTrade(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTradeInput) => createTradeAction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradesQueryKey(accountId) });
    },
  });
}

export function useCreateManyTrades(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inputs: CreateTradeInput[]) => createManyTradesAction(inputs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradesQueryKey(accountId) });
    },
  });
}

export function useUpdateTrade(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateTradeInput> }) => updateTradeAction(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradesQueryKey(accountId) });
    },
  });
}

export function useDeleteTrade(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTradeAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradesQueryKey(accountId) });
    },
  });
}

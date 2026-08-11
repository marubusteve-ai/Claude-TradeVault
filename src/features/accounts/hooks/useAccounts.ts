"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateAccountInput, CreatePropFirmRuleSetInput, PayoutRecord } from "@trading-os/shared-types";
import {
  listAccountsAction,
  createAccountAction,
  updateAccountAction,
  listRuleSetsAction,
  createRuleSetAction,
  updateRuleSetAction,
  getAccountComplianceAction,
  listPayoutsAction,
  createPayoutAction,
} from "../lib/actions";

export function useAccounts() {
  return useQuery({ queryKey: ["accounts"], queryFn: listAccountsAction });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccountInput) => createAccountAction(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateAccountInput> }) => updateAccountAction(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useRuleSets() {
  return useQuery({ queryKey: ["rule-sets"], queryFn: listRuleSetsAction });
}

export function useCreateRuleSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePropFirmRuleSetInput) => createRuleSetAction(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rule-sets"] }),
  });
}

export function useUpdateRuleSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreatePropFirmRuleSetInput> }) => updateRuleSetAction(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rule-sets"] }),
  });
}

export function useAccountCompliance(accountId: string) {
  return useQuery({ queryKey: ["account-compliance", accountId], queryFn: () => getAccountComplianceAction(accountId) });
}

export function usePayouts(accountId: string) {
  return useQuery({ queryKey: ["payouts", accountId], queryFn: () => listPayoutsAction(accountId) });
}

export function useCreatePayout(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<PayoutRecord, "id" | "createdAt">) => createPayoutAction(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payouts", accountId] }),
  });
}

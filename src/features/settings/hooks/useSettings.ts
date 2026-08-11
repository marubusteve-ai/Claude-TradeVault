"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateCustomFieldDefinitionInput, CustomFieldDefinitionRecord } from "@trading-os/shared-types";
import { listCustomFieldsAction, createCustomFieldAction, deleteCustomFieldAction } from "../lib/actions";

export function useCustomFields(entityType?: CustomFieldDefinitionRecord["entityType"]) {
  return useQuery({ queryKey: ["custom-fields", entityType ?? "all"], queryFn: () => listCustomFieldsAction(entityType) });
}

export function useCreateCustomField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomFieldDefinitionInput) => createCustomFieldAction(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["custom-fields"] }),
  });
}

export function useDeleteCustomField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomFieldAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["custom-fields"] }),
  });
}

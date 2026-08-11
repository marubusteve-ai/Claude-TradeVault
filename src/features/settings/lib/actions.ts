"use server";

import { revalidatePath } from "next/cache";
import type { CreateCustomFieldDefinitionInput, CustomFieldDefinitionRecord } from "@trading-os/shared-types";
import { customFieldDefinitionRepository } from "@/lib/repositories";
import { DEMO_USER_ID } from "@/lib/demo-data";

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listCustomFieldsAction(
  entityType?: CustomFieldDefinitionRecord["entityType"]
): Promise<CustomFieldDefinitionRecord[]> {
  return customFieldDefinitionRepository.findByUser(DEMO_USER_ID, entityType);
}

export async function createCustomFieldAction(input: CreateCustomFieldDefinitionInput): Promise<CustomFieldDefinitionRecord> {
  const definition: CustomFieldDefinitionRecord = { ...input, id: generateId("field") };
  await customFieldDefinitionRepository.save(definition);
  revalidatePath("/settings");
  revalidatePath("/journal");
  return definition;
}

export async function deleteCustomFieldAction(id: string): Promise<void> {
  await customFieldDefinitionRepository.delete(id);
  revalidatePath("/settings");
  revalidatePath("/journal");
}

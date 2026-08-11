"use server";

import { revalidatePath } from "next/cache";
import { RecordTradeUseCase } from "@trading-os/application";
import type { CreateTradeInput, TradeRecord } from "@trading-os/shared-types";
import { tradeRepository } from "@/lib/repositories";

/**
 * Server Actions are the mutation boundary for this phase: client
 * components call these directly (Next.js handles the client/server RPC
 * transparently), and they call the *exact same* application-layer use
 * cases `apps/api`'s tRPC routers will call once that exists. Nothing in
 * TradeForm or TradeTable needs to change when a real backend replaces
 * this file's dependency on the in-memory repository — only the
 * repository construction in @/lib/repositories moves to Postgres.
 */

export async function createTradeAction(input: CreateTradeInput): Promise<TradeRecord> {
  const useCase = new RecordTradeUseCase({
    tradeRepository,
    idGenerator: () => `trade-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    clock: () => new Date(),
  });
  const trade = await useCase.execute(input);
  revalidatePath("/journal");
  revalidatePath("/dashboard");
  return trade;
}

export async function createManyTradesAction(inputs: CreateTradeInput[]): Promise<TradeRecord[]> {
  const useCase = new RecordTradeUseCase({
    tradeRepository,
    idGenerator: () => `trade-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    clock: () => new Date(),
  });
  const created: TradeRecord[] = [];
  for (const input of inputs) {
    created.push(await useCase.execute(input));
  }
  revalidatePath("/journal");
  revalidatePath("/dashboard");
  return created;
}

export async function updateTradeAction(id: string, input: Partial<CreateTradeInput>): Promise<TradeRecord> {
  const existing = await tradeRepository.findById(id);
  if (!existing) throw new Error(`Trade ${id} not found`);

  const updated: TradeRecord = { ...existing, ...input, id: existing.id, updatedAt: new Date().toISOString() };
  await tradeRepository.save(updated);
  revalidatePath("/journal");
  revalidatePath("/dashboard");
  return updated;
}

export async function deleteTradeAction(id: string): Promise<void> {
  await tradeRepository.delete(id);
  revalidatePath("/journal");
  revalidatePath("/dashboard");
}

export async function listTradesAction(accountId: string): Promise<TradeRecord[]> {
  return tradeRepository.findByAccount(accountId);
}

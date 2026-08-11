"use server";

import { revalidatePath } from "next/cache";
import { Trade } from "@trading-os/domain";
import { calculateBasicMetrics, calculateSetupScore, type SetupScoreResult, type BasicMetrics } from "@trading-os/analytics-engine";
import type { CreateStrategyInput, StrategyRecord, SetupRecord } from "@trading-os/shared-types";
import { strategyRepository, setupRepository, tradeRepository, accountRepository } from "@/lib/repositories";
import { DEMO_USER_ID } from "@/lib/demo-data";

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listStrategiesAction(): Promise<StrategyRecord[]> {
  return strategyRepository.findByUser(DEMO_USER_ID);
}

export async function createStrategyAction(input: CreateStrategyInput): Promise<StrategyRecord> {
  const now = new Date().toISOString();
  const strategy: StrategyRecord = { ...input, id: generateId("strategy"), createdAt: now, updatedAt: now };
  await strategyRepository.save(strategy);
  revalidatePath("/playbook");
  return strategy;
}

export async function updateStrategyAction(id: string, input: Partial<CreateStrategyInput>): Promise<StrategyRecord> {
  const existing = await strategyRepository.findById(id);
  if (!existing) throw new Error(`Strategy ${id} not found`);
  const updated: StrategyRecord = { ...existing, ...input, id: existing.id, updatedAt: new Date().toISOString() };
  await strategyRepository.save(updated);
  revalidatePath("/playbook");
  revalidatePath(`/playbook/${id}`);
  return updated;
}

export async function deleteStrategyAction(id: string): Promise<void> {
  await strategyRepository.delete(id);
  revalidatePath("/playbook");
}

export interface StrategyPerformanceBundle {
  strategy: StrategyRecord;
  metrics: BasicMetrics;
  score: SetupScoreResult;
  setups: SetupRecord[];
}

/**
 * Every number on the strategy detail page traces back to this — real
 * trades tagged with this strategyId, across every account the trader
 * has, run through the same analytics-engine functions every other
 * module uses. Nothing here is a second implementation of the metrics.
 */
export async function getStrategyPerformanceAction(strategyId: string): Promise<StrategyPerformanceBundle> {
  const strategy = await strategyRepository.findById(strategyId);
  if (!strategy) throw new Error(`Strategy ${strategyId} not found`);

  const accounts = await accountRepository.findByUser(DEMO_USER_ID);
  const tradeRecordsByAccount = await Promise.all(accounts.map((a) => tradeRepository.findByAccount(a.id, { strategyId, status: "closed" })));
  const trades = tradeRecordsByAccount.flat().map(Trade.fromRecord);

  const metricInputs = trades.map((t) => ({
    netPnL: t.netPnL?.toMajor() ?? 0,
    rMultiple: t.rMultipleAchieved,
    isWinner: t.isWinner,
    isClosed: t.status === "closed",
  }));
  const metrics = calculateBasicMetrics(metricInputs);
  const score = calculateSetupScore({ metrics, sampleSize: trades.length });
  const setups = await setupRepository.findByStrategy(strategyId);

  return { strategy, metrics, score, setups };
}

export async function createSetupAction(input: CreateStrategyInput & { strategyId: string }): Promise<SetupRecord> {
  const now = new Date().toISOString();
  const setup: SetupRecord = { ...input, id: generateId("setup"), createdAt: now, updatedAt: now };
  await setupRepository.save(setup);
  revalidatePath(`/playbook/${input.strategyId}`);
  return setup;
}

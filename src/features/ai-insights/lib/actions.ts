"use server";

import type { TradeReview, MistakePattern, SetupGrade } from "@trading-os/ai-services";
import { accountRepository, tradeRepository, strategyRepository } from "@/lib/repositories";
import { DEMO_USER_ID } from "@/lib/demo-data";
import { getInsightService } from "./getInsightService";

export interface WithMode<T> {
  result: T;
  mode: "ai" | "heuristic";
}

async function getAllTradesForUser() {
  const accounts = await accountRepository.findByUser(DEMO_USER_ID);
  const arrays = await Promise.all(accounts.map((a) => tradeRepository.findByAccount(a.id)));
  return arrays.flat();
}

export async function generateTradeReviewAction(tradeId: string): Promise<WithMode<TradeReview>> {
  const allTrades = await getAllTradesForUser();
  const trade = allTrades.find((t) => t.id === tradeId);
  if (!trade) throw new Error(`Trade ${tradeId} not found`);

  const related = allTrades.filter((t) => t.id !== tradeId && t.strategyId === trade.strategyId && t.status === "closed").slice(0, 20);

  const { service, mode } = getInsightService();
  const result = await service.generateTradeReview(trade, related);
  return { result, mode };
}

export async function detectMistakePatternsAction(): Promise<WithMode<MistakePattern[]>> {
  const allTrades = await getAllTradesForUser();
  const { service, mode } = getInsightService();
  const result = await service.detectMistakePatterns(allTrades.filter((t) => t.status === "closed"));
  return { result, mode };
}

export async function gradeSetupAction(strategyId: string): Promise<WithMode<SetupGrade>> {
  const allTrades = await getAllTradesForUser();
  const strategyTrades = allTrades.filter((t) => t.strategyId === strategyId && t.status === "closed");

  const { service, mode } = getInsightService();
  const result = await service.gradeSetup(strategyId, strategyTrades);
  return { result, mode };
}

export async function summarizeJournalAction(periodLabel: string, sinceDaysAgo: number): Promise<WithMode<string>> {
  const allTrades = await getAllTradesForUser();
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - sinceDaysAgo);
  const periodTrades = allTrades.filter((t) => t.exitTime && new Date(t.exitTime) >= cutoff);

  const { service, mode } = getInsightService();
  const result = await service.summarizeJournal(periodTrades, periodLabel);
  return { result, mode };
}

export async function listRecentTradesForReviewAction() {
  const allTrades = await getAllTradesForUser();
  return allTrades
    .filter((t) => t.status === "closed")
    .sort((a, b) => (b.exitTime ?? "").localeCompare(a.exitTime ?? ""))
    .slice(0, 30)
    .map((t) => ({ id: t.id, instrument: t.instrument, exitTime: t.exitTime, direction: t.direction }));
}

export async function listStrategiesForGradingAction() {
  const strategies = await strategyRepository.findByUser(DEMO_USER_ID);
  return strategies.map((s) => ({ id: s.id, name: s.name }));
}

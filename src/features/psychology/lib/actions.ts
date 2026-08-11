"use server";

import { revalidatePath } from "next/cache";
import { Trade } from "@trading-os/domain";
import {
  correlatePsychologyWithPerformance,
  calculateMistakeFrequency,
  type PsychologyPerformanceBucket,
  type MistakeFrequencyResult,
} from "@trading-os/analytics-engine";
import type { CreatePsychologyEntryInput, PsychologyEntryRecord } from "@trading-os/shared-types";
import { psychologyRepository, tradeRepository, accountRepository } from "@/lib/repositories";
import { DEMO_USER_ID } from "@/lib/demo-data";

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listPsychologyEntriesAction(): Promise<PsychologyEntryRecord[]> {
  return psychologyRepository.findByUser(DEMO_USER_ID);
}

export async function createPsychologyEntryAction(input: CreatePsychologyEntryInput): Promise<PsychologyEntryRecord> {
  const entry: PsychologyEntryRecord = { ...input, id: generateId("psych"), createdAt: new Date().toISOString() };
  await psychologyRepository.save(entry);
  revalidatePath("/psychology");
  return entry;
}

export interface BehavioralAnalyticsBundle {
  disciplineCorrelation: PsychologyPerformanceBucket[];
  moodCorrelation: PsychologyPerformanceBucket[];
  mistakeFrequency: MistakeFrequencyResult[];
  entries: PsychologyEntryRecord[];
}

/**
 * Correlates logged psychology ratings against real trade outcomes across
 * every account, and ranks mistake categories by actual dollar cost —
 * both computed by @trading-os/analytics-engine, not re-derived here.
 */
export async function getBehavioralAnalyticsAction(): Promise<BehavioralAnalyticsBundle> {
  const entries = await psychologyRepository.findByUser(DEMO_USER_ID);
  const accounts = await accountRepository.findByUser(DEMO_USER_ID);
  const tradeRecordsByAccount = await Promise.all(accounts.map((a) => tradeRepository.findByAccount(a.id, { status: "closed" })));
  const tradeRecords = tradeRecordsByAccount.flat();
  const trades = tradeRecords.map(Trade.fromRecord);

  const tradesByDate = new Map<string, { netPnL: number; rMultiple: number | null; isWinner: boolean; isClosed: boolean }[]>();
  trades.forEach((trade, i) => {
    const record = tradeRecords[i]!;
    const day = record.exitTime?.slice(0, 10);
    if (!day) return;
    const bucket = tradesByDate.get(day) ?? [];
    bucket.push({ netPnL: trade.netPnL?.toMajor() ?? 0, rMultiple: trade.rMultipleAchieved, isWinner: trade.isWinner, isClosed: true });
    tradesByDate.set(day, bucket);
  });

  const disciplineByDate = entries.filter((e) => e.discipline != null).map((e) => ({ date: e.date.slice(0, 10), value: e.discipline! }));
  const moodByDate = entries.filter((e) => e.mood != null).map((e) => ({ date: e.date.slice(0, 10), value: e.mood! }));

  const mistakeInputs = tradeRecords.map((r) => ({ mistakes: r.mistakes, netPnL: Trade.fromRecord(r).netPnL?.toMajor() ?? 0 }));

  return {
    disciplineCorrelation: correlatePsychologyWithPerformance(disciplineByDate, tradesByDate),
    moodCorrelation: correlatePsychologyWithPerformance(moodByDate, tradesByDate),
    mistakeFrequency: calculateMistakeFrequency(mistakeInputs),
    entries,
  };
}

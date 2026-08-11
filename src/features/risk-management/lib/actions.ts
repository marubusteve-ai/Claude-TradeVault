"use server";

import { TradingAccount, Trade, ComplianceEvaluator } from "@trading-os/domain";
import { GenerateRiskAlertsUseCase } from "@trading-os/application";
import type { NotificationRecord } from "@trading-os/shared-types";
import { accountRepository, tradeRepository, ruleSetRepository, notificationRepository } from "@/lib/repositories";
import { DEMO_USER_ID } from "@/lib/demo-data";

export interface AccountRiskStatus {
  accountId: string;
  accountName: string;
  checks: { ruleId: string; label: string; status: string; currentValue: number; limitValue: number | null; detail: string }[];
}

export async function getRiskDashboardAction(): Promise<AccountRiskStatus[]> {
  const accounts = await accountRepository.findByUser(DEMO_USER_ID);
  const results: AccountRiskStatus[] = [];

  for (const accountRecord of accounts) {
    if (!accountRecord.ruleSetId) continue;
    const ruleSet = await ruleSetRepository.findById(accountRecord.ruleSetId);
    if (!ruleSet) continue;

    const account = TradingAccount.fromRecord(accountRecord);
    const tradeRecords = await tradeRepository.findByAccount(accountRecord.id);
    const trades = tradeRecords.map(Trade.fromRecord);
    const report = new ComplianceEvaluator().evaluate(account, ruleSet, trades);

    results.push({
      accountId: accountRecord.id,
      accountName: accountRecord.name,
      checks: report.checks.filter((c) => c.ruleId.includes("loss_limit") || c.ruleId === "max_drawdown"),
    });
  }

  return results;
}

export async function listNotificationsAction(): Promise<NotificationRecord[]> {
  return notificationRepository.findByUser(DEMO_USER_ID);
}

export async function markNotificationReadAction(id: string): Promise<void> {
  await notificationRepository.markRead(id);
}

/** Runs the automatic warning system on demand — the same use case a scheduled job would call. */
export async function generateRiskAlertsAction(): Promise<NotificationRecord[]> {
  const useCase = new GenerateRiskAlertsUseCase({
    accountRepository,
    tradeRepository,
    notificationRepository,
    getRuleSet: (id) => ruleSetRepository.findById(id),
    idGenerator: () => `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    clock: () => new Date(),
  });
  return useCase.execute(DEMO_USER_ID);
}

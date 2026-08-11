"use server";

import { revalidatePath } from "next/cache";
import { TradingAccount, Trade, ComplianceEvaluator } from "@trading-os/domain";
import type { ComplianceReport } from "@trading-os/domain";
import type { CreateAccountInput, TradingAccountRecord, CreatePropFirmRuleSetInput, PropFirmRuleSetRecord, PayoutRecord } from "@trading-os/shared-types";
import { accountRepository, ruleSetRepository, payoutRepository, tradeRepository } from "@/lib/repositories";
import { DEMO_USER_ID } from "@/lib/demo-data";

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listAccountsAction(): Promise<TradingAccountRecord[]> {
  return accountRepository.findByUser(DEMO_USER_ID);
}

export async function createAccountAction(input: CreateAccountInput): Promise<TradingAccountRecord> {
  const now = new Date().toISOString();
  const account: TradingAccountRecord = { ...input, id: generateId("account"), createdAt: now, updatedAt: now };
  await accountRepository.save(account);
  revalidatePath("/accounts");
  return account;
}

export async function updateAccountAction(id: string, input: Partial<CreateAccountInput>): Promise<TradingAccountRecord> {
  const existing = await accountRepository.findById(id);
  if (!existing) throw new Error(`Account ${id} not found`);
  const updated: TradingAccountRecord = { ...existing, ...input, id: existing.id, updatedAt: new Date().toISOString() };
  await accountRepository.save(updated);
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${id}`);
  return updated;
}

export async function listRuleSetsAction(): Promise<PropFirmRuleSetRecord[]> {
  return ruleSetRepository.findByUser(DEMO_USER_ID);
}

export async function createRuleSetAction(input: CreatePropFirmRuleSetInput): Promise<PropFirmRuleSetRecord> {
  const now = new Date().toISOString();
  const ruleSet: PropFirmRuleSetRecord = { ...input, id: generateId("ruleset"), createdAt: now, updatedAt: now };
  await ruleSetRepository.save(ruleSet);
  revalidatePath("/accounts");
  return ruleSet;
}

export async function updateRuleSetAction(id: string, input: Partial<CreatePropFirmRuleSetInput>): Promise<PropFirmRuleSetRecord> {
  const existing = await ruleSetRepository.findById(id);
  if (!existing) throw new Error(`Rule set ${id} not found`);
  const updated: PropFirmRuleSetRecord = { ...existing, ...input, id: existing.id, updatedAt: new Date().toISOString() };
  await ruleSetRepository.save(updated);
  revalidatePath("/accounts");
  return updated;
}

export interface AccountComplianceBundle {
  account: TradingAccountRecord;
  ruleSet: PropFirmRuleSetRecord | null;
  report: ComplianceReport | null;
  fundingReadinessScore: number | null;
  currentBalance: number;
  netPnL: number;
}

/**
 * Everything the compliance dashboard needs for one account, computed via
 * the exact same ComplianceEvaluator validated back in Phase 0 — this
 * action is a thin orchestration layer, not a second implementation of
 * the rule logic.
 */
export async function getAccountComplianceAction(accountId: string): Promise<AccountComplianceBundle> {
  const accountRecord = await accountRepository.findById(accountId);
  if (!accountRecord) throw new Error(`Account ${accountId} not found`);

  const account = TradingAccount.fromRecord(accountRecord);
  const tradeRecords = await tradeRepository.findByAccount(accountId);
  const trades = tradeRecords.map(Trade.fromRecord);
  const currentBalance = account.currentBalance(trades).toMajor();
  const netPnL = account.netPnL(trades).toMajor();

  if (!accountRecord.ruleSetId) {
    return { account: accountRecord, ruleSet: null, report: null, fundingReadinessScore: null, currentBalance, netPnL };
  }

  const ruleSet = await ruleSetRepository.findById(accountRecord.ruleSetId);
  if (!ruleSet) {
    return { account: accountRecord, ruleSet: null, report: null, fundingReadinessScore: null, currentBalance, netPnL };
  }

  const evaluator = new ComplianceEvaluator();
  const report = evaluator.evaluate(account, ruleSet, trades);
  const fundingReadinessScore = evaluator.calculateFundingReadinessScore(report);

  return { account: accountRecord, ruleSet, report, fundingReadinessScore, currentBalance, netPnL };
}

export async function listPayoutsAction(accountId: string): Promise<PayoutRecord[]> {
  return payoutRepository.findByAccount(accountId);
}

export async function createPayoutAction(input: Omit<PayoutRecord, "id" | "createdAt">): Promise<PayoutRecord> {
  const payout: PayoutRecord = { ...input, id: generateId("payout"), createdAt: new Date().toISOString() };
  await payoutRepository.save(payout);
  revalidatePath(`/accounts/${input.accountId}`);
  return payout;
}

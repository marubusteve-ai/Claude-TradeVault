import type { AccountRepository, TradeRepository, NotificationRepository } from "@trading-os/domain";
import { TradingAccount, Trade, ComplianceEvaluator } from "@trading-os/domain";
import type { PropFirmRuleSetRecord, NotificationRecord } from "@trading-os/shared-types";

export interface GenerateRiskAlertsDependencies {
  accountRepository: AccountRepository;
  tradeRepository: TradeRepository;
  notificationRepository: NotificationRepository;
  getRuleSet: (ruleSetId: string) => Promise<PropFirmRuleSetRecord | null>;
  idGenerator: () => string;
  clock: () => Date;
}

/**
 * The automatic warning system: evaluates every account with a configured
 * rule set through ComplianceEvaluator (the same one the compliance
 * dashboard uses) and writes a notification for any check currently at
 * warning or breach. Skips accounts that already have an unread
 * notification for the same rule today, so re-running this doesn't spam
 * duplicates — call it from a scheduled job or on-demand from the UI.
 */
export class GenerateRiskAlertsUseCase {
  constructor(private readonly deps: GenerateRiskAlertsDependencies) {}

  async execute(userId: string): Promise<NotificationRecord[]> {
    const accounts = await this.deps.accountRepository.findByUser(userId);
    const existingUnread = await this.deps.notificationRepository.findByUser(userId, true);
    const today = this.deps.clock().toISOString().slice(0, 10);
    const created: NotificationRecord[] = [];

    for (const accountRecord of accounts) {
      if (!accountRecord.ruleSetId) continue;
      const ruleSet = await this.deps.getRuleSet(accountRecord.ruleSetId);
      if (!ruleSet) continue;

      const account = TradingAccount.fromRecord(accountRecord);
      const tradeRecords = await this.deps.tradeRepository.findByAccount(accountRecord.id);
      const trades = tradeRecords.map(Trade.fromRecord);
      const report = new ComplianceEvaluator().evaluate(account, ruleSet, trades);

      for (const check of report.checks) {
        if (check.status !== "warning" && check.status !== "breach") continue;

        const alreadyAlertedToday = existingUnread.some(
          (n) => n.accountId === accountRecord.id && n.type === check.ruleId && n.createdAt.slice(0, 10) === today
        );
        if (alreadyAlertedToday) continue;

        const notification: NotificationRecord = {
          id: this.deps.idGenerator(),
          userId,
          accountId: accountRecord.id,
          type: check.ruleId,
          title: `${accountRecord.name}: ${check.label} ${check.status === "breach" ? "breached" : "approaching limit"}`,
          body: check.detail,
          severity: check.status === "breach" ? "critical" : "warning",
          createdAt: this.deps.clock().toISOString(),
        };
        await this.deps.notificationRepository.save(notification);
        created.push(notification);
      }
    }

    return created;
  }
}

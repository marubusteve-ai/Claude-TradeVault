import type { AccountRepository, TradeRepository, ComplianceReport } from "@trading-os/domain";
import { TradingAccount, Trade, ComplianceEvaluator } from "@trading-os/domain";
import type { PropFirmRuleSetRecord } from "@trading-os/shared-types";

export interface EvaluateAccountComplianceDependencies {
  accountRepository: AccountRepository;
  tradeRepository: TradeRepository;
  getRuleSet: (ruleSetId: string) => Promise<PropFirmRuleSetRecord | null>;
}

/** Powers the Prop Firm Integration dashboard's live compliance card and the automated rule-violation alert job. */
export class EvaluateAccountComplianceUseCase {
  constructor(private readonly deps: EvaluateAccountComplianceDependencies) {}

  async execute(accountId: string): Promise<ComplianceReport> {
    const accountRecord = await this.deps.accountRepository.findById(accountId);
    if (!accountRecord) throw new Error(`Account ${accountId} not found`);
    if (!accountRecord.ruleSetId) throw new Error(`Account ${accountId} has no rule set configured`);

    const ruleSet = await this.deps.getRuleSet(accountRecord.ruleSetId);
    if (!ruleSet) throw new Error(`Rule set ${accountRecord.ruleSetId} not found`);

    const tradeRecords = await this.deps.tradeRepository.findByAccount(accountId);
    const account = TradingAccount.fromRecord(accountRecord);
    const trades = tradeRecords.map(Trade.fromRecord);

    return new ComplianceEvaluator().evaluate(account, ruleSet, trades);
  }
}

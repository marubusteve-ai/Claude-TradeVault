import {
  TradeRepositoryMemory,
  AccountRepositoryMemory,
  PropFirmRuleSetRepositoryMemory,
  PayoutRepositoryMemory,
  StrategyRepositoryMemory,
  SetupRepositoryMemory,
  PsychologyEntryRepositoryMemory,
  NotificationRepositoryMemory,
  CustomFieldDefinitionRepositoryMemory,
} from "@trading-os/persistence-memory";
import {
  DEMO_ACCOUNTS,
  DEMO_RULE_SETS,
  DEMO_PAYOUTS,
  DEMO_ACCOUNT_ID,
  DEMO_ACCOUNT_2_ID,
  DEMO_STRATEGIES,
  generateDemoTrades,
  generateDemoPsychologyEntries,
} from "./demo-data";

/**
 * Module-level singletons backing the demo. Every consumer — use cases,
 * dashboard loaders, future feature modules — depends only on the
 * TradeRepository/AccountRepository/PropFirmRuleSetRepository/
 * PayoutRepository/StrategyRepository/SetupRepository/
 * PsychologyEntryRepository *ports* from @trading-os/domain, never on
 * this file directly except at the composition root. Moving from demo
 * mode to a real backend is replacing this one file with one that
 * constructs @trading-os/persistence-postgres repositories instead; no
 * other file in the app changes.
 */
const demoTrades = [...generateDemoTrades(68, 42, DEMO_ACCOUNT_ID), ...generateDemoTrades(22, 91, DEMO_ACCOUNT_2_ID)];

export const tradeRepository = new TradeRepositoryMemory(demoTrades);
export const accountRepository = new AccountRepositoryMemory(DEMO_ACCOUNTS);
export const ruleSetRepository = new PropFirmRuleSetRepositoryMemory(DEMO_RULE_SETS);
export const payoutRepository = new PayoutRepositoryMemory(DEMO_PAYOUTS);
export const strategyRepository = new StrategyRepositoryMemory(DEMO_STRATEGIES);
export const setupRepository = new SetupRepositoryMemory([]);
export const psychologyRepository = new PsychologyEntryRepositoryMemory(
  generateDemoPsychologyEntries(demoTrades.filter((t) => t.accountId === DEMO_ACCOUNT_ID))
);
export const notificationRepository = new NotificationRepositoryMemory([]);
export const customFieldDefinitionRepository = new CustomFieldDefinitionRepositoryMemory([]);

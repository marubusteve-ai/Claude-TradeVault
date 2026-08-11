import type {
  TradeRecord,
  TradingAccountRecord,
  PropFirmRuleSetRecord,
  PayoutRecord,
  StrategyRecord,
  SetupRecord,
  PsychologyEntryRecord,
  NotificationRecord,
  CustomFieldDefinitionRecord,
} from "@trading-os/shared-types";

/**
 * Repository ports. The application layer depends only on these interfaces,
 * never on Prisma or Dexie directly — @trading-os/persistence-postgres and
 * @trading-os/persistence-indexeddb each provide a concrete implementation.
 * The same use case runs unmodified against the server (source of truth)
 * or the client (offline-first local cache) because both satisfy the same
 * contract.
 */
export interface TradeQueryFilter {
  from?: string;
  to?: string;
  strategyId?: string;
  setupId?: string;
  status?: TradeRecord["status"];
  tags?: string[];
}

export interface TradeRepository {
  findById(id: string): Promise<TradeRecord | null>;
  findByAccount(accountId: string, filter?: TradeQueryFilter): Promise<TradeRecord[]>;
  save(trade: TradeRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface AccountRepository {
  findById(id: string): Promise<TradingAccountRecord | null>;
  findByUser(userId: string): Promise<TradingAccountRecord[]>;
  save(account: TradingAccountRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface PropFirmRuleSetRepository {
  findById(id: string): Promise<PropFirmRuleSetRecord | null>;
  findByUser(userId: string): Promise<PropFirmRuleSetRecord[]>;
  save(ruleSet: PropFirmRuleSetRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface PayoutRepository {
  findByAccount(accountId: string): Promise<PayoutRecord[]>;
  save(payout: PayoutRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface StrategyRepository {
  findById(id: string): Promise<StrategyRecord | null>;
  findByUser(userId: string): Promise<StrategyRecord[]>;
  save(strategy: StrategyRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface SetupRepository {
  findById(id: string): Promise<SetupRecord | null>;
  findByStrategy(strategyId: string): Promise<SetupRecord[]>;
  save(setup: SetupRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface PsychologyEntryRepository {
  findByUser(userId: string, dateRange?: { from: string; to: string }): Promise<PsychologyEntryRecord[]>;
  findByDate(userId: string, date: string): Promise<PsychologyEntryRecord | null>;
  save(entry: PsychologyEntryRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface NotificationRepository {
  findByUser(userId: string, unreadOnly?: boolean): Promise<NotificationRecord[]>;
  save(notification: NotificationRecord): Promise<void>;
  markRead(id: string): Promise<void>;
}

export interface CustomFieldDefinitionRepository {
  findByUser(userId: string, entityType?: CustomFieldDefinitionRecord["entityType"]): Promise<CustomFieldDefinitionRecord[]>;
  save(definition: CustomFieldDefinitionRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface AuthSession {
  userId: string;
  email: string;
  expiresAt: string;
}

/**
 * The authentication contract, defined now so the eventual real
 * implementation (Phase 10+, backed by Auth.js or a hand-rolled
 * JWT-plus-refresh-token flow per ARCHITECTURE.md §8) has a stable
 * interface to satisfy. No implementation ships yet — this app has no
 * real user table to authenticate against until persistence-postgres is
 * wired up, and a login screen that doesn't check real credentials would
 * be exactly the kind of placeholder this codebase has avoided
 * everywhere else. Defining the port now means every future call site
 * (middleware, server actions) can be written against a stable contract
 * today and wired to a real implementation later with no call-site
 * changes — the same reason every other port in this file exists before
 * its "final" implementation does.
 */
export interface AuthService {
  signIn(email: string, password: string): Promise<AuthSession>;
  signUp(email: string, password: string, name?: string): Promise<AuthSession>;
  signOut(sessionToken: string): Promise<void>;
  getSession(sessionToken: string): Promise<AuthSession | null>;
  refreshSession(refreshToken: string): Promise<AuthSession>;
}

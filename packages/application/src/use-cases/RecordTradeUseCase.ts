import type { TradeRepository } from "@trading-os/domain";
import { CreateTradeInputSchema, type CreateTradeInput, type TradeRecord } from "@trading-os/shared-types";

export interface RecordTradeDependencies {
  tradeRepository: TradeRepository;
  idGenerator: () => string;
  clock: () => Date;
}

/**
 * Validates and persists a new trade entry. The manual trade-entry form,
 * the CSV importer, and future broker-sync integrations all funnel through
 * this single use case so business rules and validation apply identically
 * no matter how the trade data arrived.
 */
export class RecordTradeUseCase {
  constructor(private readonly deps: RecordTradeDependencies) {}

  async execute(input: CreateTradeInput): Promise<TradeRecord> {
    const validated = CreateTradeInputSchema.parse(input);
    const now = this.deps.clock().toISOString();
    const trade: TradeRecord = { ...validated, id: this.deps.idGenerator(), createdAt: now, updatedAt: now };
    await this.deps.tradeRepository.save(trade);
    return trade;
  }
}

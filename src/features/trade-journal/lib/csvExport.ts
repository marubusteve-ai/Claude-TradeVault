import Papa from "papaparse";
import type { TradeRecord } from "@trading-os/shared-types";
import { Trade } from "@trading-os/domain";

const EXPORT_COLUMNS = [
  "exitTime",
  "entryTime",
  "instrument",
  "assetClass",
  "direction",
  "session",
  "timeframe",
  "entryPrice",
  "exitPrice",
  "quantity",
  "stopLossPrice",
  "commission",
  "swap",
  "netPnL",
  "rMultiple",
  "outcome",
  "strategyId",
  "tags",
  "comment",
  "rating",
] as const;

/** Exports the same figures the journal table shows — netPnL and rMultiple come from the Trade entity, not recomputed inline. */
export function tradesToCsv(records: TradeRecord[]): string {
  const rows = records.map((record) => {
    const trade = Trade.fromRecord(record);
    return {
      exitTime: record.exitTime ?? "",
      entryTime: record.entryTime ?? "",
      instrument: record.instrument,
      assetClass: record.assetClass,
      direction: record.direction,
      session: record.session ?? "",
      timeframe: record.timeframe ?? "",
      entryPrice: record.entryPrice ?? "",
      exitPrice: record.exitPrice ?? "",
      quantity: record.quantity,
      stopLossPrice: record.stopLossPrice ?? "",
      commission: record.commission,
      swap: record.swap,
      netPnL: trade.netPnL?.toMajor() ?? "",
      rMultiple: trade.rMultipleAchieved ?? "",
      outcome: trade.outcome ?? "",
      strategyId: record.strategyId ?? "",
      tags: record.tags.join("|"),
      comment: record.comment ?? "",
      rating: record.rating ?? "",
    };
  });

  return Papa.unparse({ fields: [...EXPORT_COLUMNS], data: rows });
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

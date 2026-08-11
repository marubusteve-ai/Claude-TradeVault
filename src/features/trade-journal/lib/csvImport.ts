import Papa from "papaparse";
import { CreateTradeInputSchema, type CreateTradeInput } from "@trading-os/shared-types";

export interface CsvImportRowError {
  row: number;
  message: string;
}

export interface CsvImportResult {
  validTrades: CreateTradeInput[];
  errors: CsvImportRowError[];
  totalRows: number;
}

/**
 * Broker/platform exports name columns inconsistently — this alias table
 * is the single place new header spellings get added as real-world CSVs
 * are tested against it, rather than every import path needing its own
 * column-matching logic.
 */
const HEADER_ALIASES: Record<string, string> = {
  date: "exitTime",
  exittime: "exitTime",
  closetime: "exitTime",
  close_time: "exitTime",
  entrytime: "entryTime",
  opentime: "entryTime",
  open_time: "entryTime",
  symbol: "instrument",
  ticker: "instrument",
  pair: "instrument",
  instrument: "instrument",
  assetclass: "assetClass",
  market: "assetClass",
  direction: "direction",
  side: "direction",
  buysell: "direction",
  entryprice: "entryPrice",
  openprice: "entryPrice",
  exitprice: "exitPrice",
  closeprice: "exitPrice",
  quantity: "quantity",
  size: "quantity",
  lots: "quantity",
  volume: "quantity",
  stoploss: "stopLossPrice",
  sl: "stopLossPrice",
  commission: "commission",
  fees: "commission",
  swap: "swap",
  comment: "comment",
  notes: "comment",
  rating: "rating",
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s_-]/g, "");
}

function coerceDirection(raw: string): "long" | "short" {
  const v = raw.trim().toLowerCase();
  if (v === "buy" || v === "long" || v === "b") return "long";
  return "short";
}

function toIsoOrUndefined(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function toNumberOrUndefined(raw: string | undefined): number | undefined {
  if (raw == null || raw === "") return undefined;
  const n = Number(raw.replace(/[,$]/g, ""));
  return Number.isNaN(n) ? undefined : n;
}

export function parseCsvToTrades(csvText: string, accountId: string): CsvImportResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });

  const headerMap = new Map<string, string>();
  for (const rawHeader of parsed.meta.fields ?? []) {
    const canonical = HEADER_ALIASES[normalizeHeader(rawHeader)];
    if (canonical) headerMap.set(rawHeader, canonical);
  }

  const validTrades: CreateTradeInput[] = [];
  const errors: CsvImportRowError[] = [];

  parsed.data.forEach((row, index) => {
    const mapped: Record<string, unknown> = {
      accountId,
      currency: "USD",
      takeProfitLevels: [],
      commission: 0,
      swap: 0,
      status: "closed",
      tags: [],
      emotionalState: [],
      mistakes: [],
      links: { screenshots: [] },
      customFields: {},
      assetClass: "forex",
      quantity: 0,
    };

    for (const [rawHeader, value] of Object.entries(row)) {
      const canonical = headerMap.get(rawHeader);
      if (!canonical) continue;

      switch (canonical) {
        case "exitTime":
        case "entryTime":
          mapped[canonical] = toIsoOrUndefined(value);
          break;
        case "direction":
          mapped.direction = coerceDirection(value);
          break;
        case "entryPrice":
        case "exitPrice":
        case "quantity":
        case "stopLossPrice":
        case "commission":
        case "swap":
        case "rating":
          mapped[canonical] = toNumberOrUndefined(value);
          break;
        default:
          mapped[canonical] = value;
      }
    }

    const result = CreateTradeInputSchema.safeParse(mapped);
    if (result.success) {
      validTrades.push(result.data);
    } else {
      errors.push({ row: index + 2, message: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") });
    }
  });

  return { validTrades, errors, totalRows: parsed.data.length };
}

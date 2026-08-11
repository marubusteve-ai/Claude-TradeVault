"use client";

import * as React from "react";
import { ArrowUpDown, Pencil, Trash2, Search } from "lucide-react";
import { Trade } from "@trading-os/domain";
import type { TradeRecord } from "@trading-os/shared-types";
import { Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@trading-os/design-system";
import { ASSET_CLASSES } from "@trading-os/shared-types";

type SortKey = "exitTime" | "instrument" | "netPnL" | "rMultiple";
type SortDirection = "asc" | "desc";

export interface TradeTableProps {
  trades: TradeRecord[];
  onEdit: (trade: TradeRecord) => void;
  onDelete: (id: string) => void;
}

function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function TradeTable({ trades, onEdit, onDelete }: TradeTableProps) {
  const [search, setSearch] = React.useState("");
  const [assetClassFilter, setAssetClassFilter] = React.useState<string>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("exitTime");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");

  const enriched = React.useMemo(
    () =>
      trades.map((record) => {
        const trade = Trade.fromRecord(record);
        return {
          record,
          trade,
          netPnL: trade.netPnL?.toMajor() ?? 0,
          rMultiple: trade.rMultipleAchieved,
        };
      }),
    [trades]
  );

  const filtered = React.useMemo(() => {
    return enriched.filter(({ record }) => {
      if (assetClassFilter !== "all" && record.assetClass !== assetClassFilter) return false;
      if (search && !record.instrument.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [enriched, assetClassFilter, search]);

  const sorted = React.useMemo(() => {
    const factor = sortDirection === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "instrument":
          return factor * a.record.instrument.localeCompare(b.record.instrument);
        case "netPnL":
          return factor * (a.netPnL - b.netPnL);
        case "rMultiple":
          return factor * ((a.rMultiple ?? 0) - (b.rMultiple ?? 0));
        case "exitTime":
        default:
          return factor * (a.record.exitTime ?? a.record.createdAt).localeCompare(b.record.exitTime ?? b.record.createdAt);
      }
    });
  }, [filtered, sortKey, sortDirection]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  }

  function SortHeader({ label, sortKeyValue }: { label: string; sortKeyValue: SortKey }) {
    return (
      <button
        type="button"
        onClick={() => toggleSort(sortKeyValue)}
        className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-text-muted hover:text-text-primary"
      >
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sortKey === sortKeyValue ? "text-brand" : ""}`} />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input placeholder="Search instrument..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-44">
          <Select value={assetClassFilter} onValueChange={setAssetClassFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All asset classes</SelectItem>
              {ASSET_CLASSES.map((ac) => (
                <SelectItem key={ac} value={ac}>
                  {ac.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-text-muted">
          {sorted.length} of {trades.length} trades
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-raised">
              <th className="px-4 py-2.5 text-left">
                <SortHeader label="Date" sortKeyValue="exitTime" />
              </th>
              <th className="px-4 py-2.5 text-left">
                <SortHeader label="Instrument" sortKeyValue="instrument" />
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">Direction</th>
              <th className="px-4 py-2.5 text-right">
                <SortHeader label="Net P&L" sortKeyValue="netPnL" />
              </th>
              <th className="px-4 py-2.5 text-right">
                <SortHeader label="R-Multiple" sortKeyValue="rMultiple" />
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">Outcome</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ record, trade, netPnL, rMultiple }) => {
              const isWin = netPnL >= 0;
              return (
                <tr key={record.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-hover">
                  <td className="whitespace-nowrap px-4 py-2.5 text-text-secondary">
                    {record.exitTime ? new Date(record.exitTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-text-primary">{record.instrument}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={record.direction === "long" ? "profit" : "loss"}>{record.direction}</Badge>
                  </td>
                  <td className={`px-4 py-2.5 text-right font-tabular font-semibold ${isWin ? "text-profit" : "text-loss"}`}>
                    {formatCurrency(netPnL)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-tabular text-text-secondary">
                    {rMultiple != null ? `${rMultiple >= 0 ? "+" : ""}${rMultiple.toFixed(2)}R` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">{trade.outcome ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        aria-label={`Edit trade ${record.instrument}`}
                        className="rounded p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(record.id)}
                        aria-label={`Delete trade ${record.instrument}`}
                        className="rounded p-1.5 text-text-muted transition-colors hover:bg-loss/15 hover:text-loss"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                  No trades match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

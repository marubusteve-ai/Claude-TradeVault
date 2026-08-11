"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@trading-os/design-system";
import type { DashboardData } from "../../lib/getDashboardData";

function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : "+";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function RecentTradesWidget({ data }: { data: DashboardData }) {
  if (data.recentTrades.length === 0) {
    return <p className="text-sm text-text-muted">No closed trades yet.</p>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <ul className="flex flex-col gap-1.5">
        {data.recentTrades.map((trade) => {
          const isWin = trade.netPnL >= 0;
          return (
            <li key={trade.id} className="flex items-center justify-between rounded-md px-1.5 py-1.5 hover:bg-surface-hover">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className={isWin ? "text-profit" : "text-loss"}>
                  {trade.direction === "long" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-text-primary">{trade.instrument}</div>
                  <div className="truncate text-xs text-text-muted">
                    {new Date(trade.exitTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {trade.strategyName ? ` · ${trade.strategyName}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span className={`font-tabular text-sm font-semibold ${isWin ? "text-profit" : "text-loss"}`}>
                  {formatCurrency(trade.netPnL)}
                </span>
                {trade.rMultiple != null && (
                  <Badge variant={isWin ? "profit" : "loss"} className="font-tabular">
                    {trade.rMultiple >= 0 ? "+" : ""}
                    {trade.rMultiple.toFixed(1)}R
                  </Badge>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

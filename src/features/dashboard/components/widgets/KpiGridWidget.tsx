"use client";

import { KpiCard } from "@trading-os/design-system";
import type { DashboardData } from "../../lib/getDashboardData";

function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function KpiGridWidget({ data }: { data: DashboardData }) {
  const { metrics, streaks, maxDrawdownPct } = data;

  const streakLabel =
    streaks.currentStreak === 0
      ? "—"
      : `${Math.abs(streaks.currentStreak)} ${streaks.currentStreak > 0 ? "win" : "loss"}${Math.abs(streaks.currentStreak) === 1 ? "" : "es"}`;

  return (
    <div className="grid h-full grid-cols-2 gap-3 sm:grid-cols-4">
      <KpiCard
        label="Net P&L"
        value={formatCurrency(metrics.netPnL)}
        sentiment={metrics.netPnL > 0 ? "positive" : metrics.netPnL < 0 ? "negative" : "neutral"}
      />
      <KpiCard label="Win Rate" value={formatPercent(metrics.winRate)} sentiment={metrics.winRate >= 0.5 ? "positive" : "neutral"} />
      <KpiCard
        label="Profit Factor"
        value={metrics.profitFactor == null ? "—" : metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2)}
        sentiment={metrics.profitFactor != null && metrics.profitFactor >= 1 ? "positive" : "negative"}
      />
      <KpiCard
        label="Expectancy"
        value={metrics.expectancy == null ? "—" : formatCurrency(metrics.expectancy)}
        sentiment={metrics.expectancy != null && metrics.expectancy > 0 ? "positive" : "negative"}
      />
      <KpiCard
        label="Avg R-Multiple"
        value={metrics.averageRMultiple == null ? "—" : `${metrics.averageRMultiple >= 0 ? "+" : ""}${metrics.averageRMultiple.toFixed(2)}R`}
        sentiment={metrics.averageRMultiple != null && metrics.averageRMultiple > 0 ? "positive" : "negative"}
      />
      <KpiCard
        label="Current Streak"
        value={streakLabel}
        sentiment={streaks.currentStreak > 0 ? "positive" : streaks.currentStreak < 0 ? "negative" : "neutral"}
      />
      <KpiCard label="Max Drawdown" value={`${maxDrawdownPct.toFixed(1)}%`} sentiment={maxDrawdownPct > 10 ? "negative" : "neutral"} />
      <KpiCard label="Total Trades" value={String(metrics.totalTrades)} sentiment="neutral" />
    </div>
  );
}

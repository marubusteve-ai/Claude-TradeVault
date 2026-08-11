"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { DashboardData } from "../../lib/getDashboardData";

function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function WinLossWidget({ data }: { data: DashboardData }) {
  const { metrics } = data;
  const breakevens = Math.max(0, metrics.totalTrades - metrics.winningTrades - metrics.losingTrades);

  const chartData = [
    { name: "Wins", value: metrics.winningTrades, color: "var(--color-profit)" },
    { name: "Losses", value: metrics.losingTrades, color: "var(--color-loss)" },
    ...(breakevens > 0 ? [{ name: "Breakeven", value: breakevens, color: "var(--color-text-muted)" }] : []),
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="65%" outerRadius="100%" paddingAngle={2} stroke="none">
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-tabular text-2xl font-semibold text-text-primary">{(metrics.winRate * 100).toFixed(0)}%</span>
          <span className="text-xs text-text-muted">win rate</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center justify-between rounded-md bg-surface-hover px-2.5 py-1.5">
          <span className="text-text-muted">Avg win</span>
          <span className="font-tabular font-medium text-profit">{formatCurrency(metrics.averageWin)}</span>
        </div>
        <div className="flex items-center justify-between rounded-md bg-surface-hover px-2.5 py-1.5">
          <span className="text-text-muted">Avg loss</span>
          <span className="font-tabular font-medium text-loss">-{formatCurrency(metrics.averageLoss)}</span>
        </div>
      </div>
    </div>
  );
}

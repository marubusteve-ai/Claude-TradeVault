"use client";

import * as React from "react";
import { scaleLinear } from "d3";
import type { DashboardData } from "../../lib/getDashboardData";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface CalendarCell {
  day: number | null;
  date: string | null;
  netPnL: number;
  tradeCount: number;
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function CalendarHeatmapWidget({ data }: { data: DashboardData }) {
  const { monthLabel, cells, profitScale, lossScale } = React.useMemo(() => {
    const byDay = new Map(data.dailyPnL.map((d) => [d.date, d] as const));

    // Anchor on the most recent day that actually has data, so the demo
    // dataset (which stops "today") always renders a populated month
    // rather than the calendar month rolling past the last trade.
    const lastDateStr = data.dailyPnL[data.dailyPnL.length - 1]?.date;
    const anchor = lastDateStr ? new Date(`${lastDateStr}T00:00:00Z`) : new Date();
    const year = anchor.getUTCFullYear();
    const month = anchor.getUTCMonth();

    const firstOfMonth = new Date(Date.UTC(year, month, 1));
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const startWeekday = firstOfMonth.getUTCDay();

    const cells: CalendarCell[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ day: null, date: null, netPnL: 0, tradeCount: 0 });
    for (let day = 1; day <= daysInMonth; day++) {
      const date = toDateKey(new Date(Date.UTC(year, month, day)));
      const bucket = byDay.get(date);
      cells.push({ day, date, netPnL: bucket?.netPnL ?? 0, tradeCount: bucket?.tradeCount ?? 0 });
    }

    const maxProfit = Math.max(1, ...data.dailyPnL.filter((d) => d.netPnL > 0).map((d) => d.netPnL));
    const maxLoss = Math.max(1, ...data.dailyPnL.filter((d) => d.netPnL < 0).map((d) => Math.abs(d.netPnL)));

    return {
      monthLabel: firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
      cells,
      profitScale: scaleLinear().domain([0, maxProfit]).range([0.12, 0.9]).clamp(true),
      lossScale: scaleLinear().domain([0, maxLoss]).range([0.12, 0.9]).clamp(true),
    };
  }, [data.dailyPnL]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 shrink-0 text-xs font-medium text-text-muted">{monthLabel}</div>
      <div className="grid flex-1 grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={`label-${i}`} className="text-center text-[10px] font-medium text-text-muted">
            {label}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (cell.day == null) return <div key={`empty-${i}`} />;

          const hasActivity = cell.tradeCount > 0;
          const isProfit = cell.netPnL > 0;
          const intensity = hasActivity ? (isProfit ? profitScale(cell.netPnL) : lossScale(Math.abs(cell.netPnL))) : 0;
          const tooltip = hasActivity
            ? `${cell.date}: ${cell.netPnL >= 0 ? "+" : ""}$${cell.netPnL.toFixed(0)} · ${cell.tradeCount} trade${cell.tradeCount === 1 ? "" : "s"}`
            : (cell.date ?? undefined);

          return (
            <div
              key={cell.date}
              title={tooltip}
              className="relative flex aspect-square flex-col items-center justify-center rounded-md border border-border-subtle"
            >
              <div
                className="absolute inset-0 rounded-md"
                style={{ backgroundColor: hasActivity ? (isProfit ? "var(--color-profit)" : "var(--color-loss)") : "transparent", opacity: intensity }}
              />
              <span className="relative z-10 text-[10px] text-text-muted">{cell.day}</span>
              {hasActivity && (
                <span className="relative z-10 font-tabular text-[10px] font-semibold text-text-primary">
                  {cell.netPnL >= 0 ? "+" : ""}
                  {(cell.netPnL / 1000).toFixed(1)}k
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

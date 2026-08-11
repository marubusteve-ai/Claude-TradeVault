"use client";

import * as React from "react";
import { scaleLinear } from "d3";
import type { PsychologyEntryRecord } from "@trading-os/shared-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@trading-os/design-system";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
type Dimension = "mood" | "confidence" | "stress" | "discipline" | "patience";
const DIMENSIONS: { key: Dimension; label: string }[] = [
  { key: "discipline", label: "Discipline" },
  { key: "mood", label: "Mood" },
  { key: "confidence", label: "Confidence" },
  { key: "stress", label: "Stress" },
  { key: "patience", label: "Patience" },
];

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function MoodCalendarWidget({ entries }: { entries: PsychologyEntryRecord[] }) {
  const [dimension, setDimension] = React.useState<Dimension>("discipline");

  const { monthLabel, cells, colorScale } = React.useMemo(() => {
    const byDay = new Map(entries.map((e) => [e.date.slice(0, 10), e] as const));
    const lastDate = entries[entries.length - 1]?.date;
    const anchor = lastDate ? new Date(`${lastDate.slice(0, 10)}T00:00:00Z`) : new Date();
    const year = anchor.getUTCFullYear();
    const month = anchor.getUTCMonth();

    const firstOfMonth = new Date(Date.UTC(year, month, 1));
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const startWeekday = firstOfMonth.getUTCDay();

    const cells: { day: number | null; date: string | null; value: number | null }[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ day: null, date: null, value: null });
    for (let day = 1; day <= daysInMonth; day++) {
      const date = toDateKey(new Date(Date.UTC(year, month, day)));
      const entry = byDay.get(date);
      cells.push({ day, date, value: entry?.[dimension] ?? null });
    }

    return {
      monthLabel: firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
      cells,
      colorScale: scaleLinear<number>().domain([1, 10]).range([0.15, 0.9]).clamp(true),
    };
  }, [entries, dimension]);

  const isInverse = dimension === "stress"; // high stress should read as "warning", not "good"

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted">{monthLabel}</span>
        <div className="w-36">
          <Select value={dimension} onValueChange={(v) => setDimension(v as Dimension)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIMENSIONS.map((d) => (
                <SelectItem key={d.key} value={d.key}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={`label-${i}`} className="text-center text-[10px] font-medium text-text-muted">
            {label}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (cell.day == null) return <div key={`empty-${i}`} />;
          const hasEntry = cell.value != null;
          const intensity = hasEntry ? colorScale(cell.value!) : 0;
          const color = isInverse ? (cell.value! > 6 ? "var(--color-loss)" : "var(--color-profit)") : "var(--color-brand)";
          return (
            <div
              key={cell.date}
              title={hasEntry ? `${cell.date}: ${cell.value}/10` : (cell.date ?? undefined)}
              className="relative flex aspect-square flex-col items-center justify-center rounded-md border border-border-subtle"
            >
              <div className="absolute inset-0 rounded-md" style={{ backgroundColor: hasEntry ? color : "transparent", opacity: intensity }} />
              <span className="relative z-10 text-[10px] text-text-muted">{cell.day}</span>
              {hasEntry && <span className="relative z-10 font-tabular text-[10px] font-semibold text-text-primary">{cell.value}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

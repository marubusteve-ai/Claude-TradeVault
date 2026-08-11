"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { DashboardData } from "../../lib/getDashboardData";

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TooltipPayloadEntry {
  payload: { date: string; drawdownPct: number };
}

function DrawdownTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  return (
    <div className="rounded-md border border-border bg-surface-raised px-3 py-2 text-xs shadow-lg">
      <div className="text-text-muted">{formatDateShort(point.date)}</div>
      <div className="font-tabular font-semibold text-loss">{point.drawdownPct.toFixed(2)}%</div>
    </div>
  );
}

export function DrawdownWidget({ data }: { data: DashboardData }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data.drawdownSeries} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="drawdownFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-loss)" stopOpacity={0} />
            <stop offset="100%" stopColor="var(--color-loss)" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          stroke="var(--color-text-muted)"
          tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--color-border)" }}
          minTickGap={40}
        />
        <YAxis
          tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          stroke="var(--color-text-muted)"
          tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <ReferenceLine y={0} stroke="var(--color-border)" />
        <Tooltip content={<DrawdownTooltip />} />
        <Area type="monotone" dataKey="drawdownPct" stroke="var(--color-loss)" strokeWidth={1.5} fill="url(#drawdownFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

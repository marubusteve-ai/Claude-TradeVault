"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DashboardData } from "../../lib/getDashboardData";

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCurrencyShort(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value.toFixed(0)}`;
}

interface TooltipPayloadEntry {
  value: number;
  payload: { date: string; equity: number };
}

function EquityTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  return (
    <div className="rounded-md border border-border bg-surface-raised px-3 py-2 text-xs shadow-lg">
      <div className="text-text-muted">{formatDateShort(point.date)}</div>
      <div className="font-tabular font-semibold text-text-primary">
        ${point.equity.toLocaleString("en-US", { maximumFractionDigits: 0 })}
      </div>
    </div>
  );
}

export function EquityCurveWidget({ data }: { data: DashboardData }) {
  const netPositive = data.metrics.netPnL >= 0;
  const lineColor = netPositive ? "var(--color-profit)" : "var(--color-loss)";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data.equityCurve} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
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
          tickFormatter={formatCurrencyShort}
          stroke="var(--color-text-muted)"
          tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          width={52}
          domain={["dataMin", "dataMax"]}
        />
        <Tooltip content={<EquityTooltip />} />
        <Area type="monotone" dataKey="equity" stroke={lineColor} strokeWidth={2} fill="url(#equityFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

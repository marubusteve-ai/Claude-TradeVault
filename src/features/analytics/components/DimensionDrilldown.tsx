"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@trading-os/design-system";
import type { DrilldownDimension } from "../lib/actions";
import { useDimensionDrilldown } from "../hooks/useAnalytics";

const DIMENSIONS: { value: DrilldownDimension; label: string }[] = [
  { value: "strategy", label: "Strategy" },
  { value: "instrument", label: "Instrument" },
  { value: "assetClass", label: "Asset Class" },
  { value: "session", label: "Session" },
  { value: "timeframe", label: "Timeframe" },
  { value: "dayOfWeek", label: "Day of Week" },
  { value: "month", label: "Month" },
];

interface ChartRow {
  key: string;
  netPnL: number;
  winRate: number;
  trades: number;
}

function DrilldownTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartRow }[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]!.payload;
  return (
    <div className="rounded-md border border-border bg-surface-raised px-3 py-2 text-xs shadow-lg">
      <div className="font-medium text-text-primary">{row.key}</div>
      <div className="mt-1 font-tabular text-text-secondary">
        ${row.netPnL.toLocaleString("en-US", { maximumFractionDigits: 0 })} · {(row.winRate * 100).toFixed(0)}% WR · {row.trades} trades
      </div>
    </div>
  );
}

export function DimensionDrilldown() {
  const [dimension, setDimension] = React.useState<DrilldownDimension>("strategy");
  const { data: groups = [] } = useDimensionDrilldown(dimension);

  const chartData: ChartRow[] = groups.map((g) => ({ key: g.key, netPnL: g.metrics.netPnL, winRate: g.metrics.winRate, trades: g.tradeCount }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance By</CardTitle>
        <div className="w-44">
          <Select value={dimension} onValueChange={(v) => setDimension(v as DrilldownDimension)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIMENSIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-text-muted">No closed trades with this dimension set yet.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                <XAxis
                  dataKey="key"
                  stroke="var(--color-text-muted)"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-border)" }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  stroke="var(--color-text-muted)"
                  tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip content={<DrilldownTooltip />} cursor={{ fill: "var(--color-surface-hover)" }} />
                <Bar dataKey="netPnL" radius={[4, 4, 0, 0]}>
                  {chartData.map((row) => (
                    <Cell key={row.key} fill={row.netPnL >= 0 ? "var(--color-profit)" : "var(--color-loss)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

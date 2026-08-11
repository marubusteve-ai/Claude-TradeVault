"use client";

import * as React from "react";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent, Input, Badge } from "@trading-os/design-system";
import { useMonteCarlo } from "../hooks/useAnalytics";

function formatCurrency(v: number): string {
  return `$${(v / 1000).toFixed(0)}k`;
}

export function MonteCarloChart() {
  const [numTrades, setNumTrades] = React.useState(50);
  const [riskPct, setRiskPct] = React.useState(1);
  const { data, isLoading } = useMonteCarlo(numTrades, riskPct);

  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.percentile50.map((p50, i) => ({
      step: i,
      p5: data.percentile5[i],
      band: (data.percentile95[i] ?? 0) - (data.percentile5[i] ?? 0),
      p50,
      p95: data.percentile95[i],
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monte Carlo Projection</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Input
            label="Trades to Project"
            type="number"
            value={numTrades}
            onChange={(e) => setNumTrades(Math.max(1, e.target.valueAsNumber || 1))}
          />
          <Input
            label="Risk per Trade (%)"
            type="number"
            step="any"
            value={riskPct}
            onChange={(e) => setRiskPct(Math.max(0.1, e.target.valueAsNumber || 1))}
          />
          {data && (
            <>
              <div className="flex flex-col justify-end gap-1">
                <span className="text-xs text-text-muted">Probability of Profit</span>
                <Badge variant="profit">{(data.probabilityOfProfit * 100).toFixed(0)}%</Badge>
              </div>
              <div className="flex flex-col justify-end gap-1">
                <span className="text-xs text-text-muted">Probability of Ruin</span>
                <Badge variant={data.probabilityOfRuin > 0.05 ? "loss" : "neutral"}>{(data.probabilityOfRuin * 100).toFixed(1)}%</Badge>
              </div>
            </>
          )}
        </div>

        {isLoading || chartData.length === 0 ? (
          <p className="text-sm text-text-muted">
            {isLoading ? "Running 1,000 simulations..." : "Not enough closed trades with R-multiples yet to bootstrap a projection."}
          </p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                <XAxis
                  dataKey="step"
                  stroke="var(--color-text-muted)"
                  tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-border)" }}
                  label={{ value: "Trades forward", position: "insideBottom", offset: -2, fontSize: 11, fill: "var(--color-text-muted)" }}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  stroke="var(--color-text-muted)"
                  tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  contentStyle={{
                    background: "var(--color-surface-raised)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Area dataKey="p5" stackId="band" stroke="none" fill="transparent" name="5th percentile" />
                <Area dataKey="band" stackId="band" stroke="none" fill="var(--color-brand)" fillOpacity={0.15} name="5th-95th range" />
                <Line dataKey="p50" stroke="var(--color-brand)" strokeWidth={2} dot={false} name="Median" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

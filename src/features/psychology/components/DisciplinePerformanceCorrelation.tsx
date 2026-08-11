"use client";

import { Card, CardHeader, CardTitle, CardContent, Badge } from "@trading-os/design-system";
import type { PsychologyPerformanceBucket } from "@trading-os/analytics-engine";

function formatPercent(v: number): string {
  return `${(v * 100).toFixed(0)}%`;
}

export function DisciplinePerformanceCorrelation({ title, buckets }: { title: string; buckets: PsychologyPerformanceBucket[] }) {
  const hasData = buckets.some((b) => b.dayCount > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-text-muted">Log a few daily check-ins to see whether your results actually shift with it.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {buckets.map((bucket) => (
              <div key={bucket.label} className="rounded-md border border-border-subtle p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-secondary">{bucket.label}</span>
                  <Badge variant="neutral">{bucket.dayCount}d</Badge>
                </div>
                {bucket.dayCount === 0 ? (
                  <p className="mt-2 text-xs text-text-muted">No days in this range yet</p>
                ) : (
                  <>
                    <div
                      className={`mt-2 font-tabular text-xl font-semibold ${bucket.metrics.netPnL >= 0 ? "text-profit" : "text-loss"}`}
                    >
                      ${bucket.metrics.netPnL.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </div>
                    <div className="mt-1 text-xs text-text-muted">
                      {formatPercent(bucket.metrics.winRate)} win rate · {bucket.metrics.totalTrades} trades
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

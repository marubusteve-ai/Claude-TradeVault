"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@trading-os/design-system";
import { useCorrelationMatrix } from "../hooks/useAnalytics";

function colorFor(correlation: number | null): string {
  if (correlation == null) return "var(--color-border-subtle)";
  return correlation >= 0 ? "var(--color-profit)" : "var(--color-loss)";
}

export function CorrelationMatrixView() {
  const { data } = useCorrelationMatrix();

  if (!data || data.entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Correlation Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">
            Needs trades with duration, R-multiple, self rating, and MAE/MFE all logged to compute real correlations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Correlation Matrix</CardTitle>
        <span className="text-xs text-text-muted">n = {data.sampleSize} trades</span>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-xs text-text-muted">
          Real Pearson correlation between your own logged numbers — e.g. does your self-rating actually predict your R-multiple, or does
          trade duration relate to outcome. Not every trader will see the same pairs light up.
        </p>
        <div className="flex flex-col gap-2">
          {data.entries.map((entry) => (
            <div key={`${entry.dimensionA}-${entry.dimensionB}`} className="flex items-center gap-3">
              <div className="w-64 shrink-0 text-xs text-text-secondary">
                {entry.dimensionA} <span className="text-text-muted">×</span> {entry.dimensionB}
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-hover">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${entry.correlation == null ? 0 : Math.abs(entry.correlation) * 100}%`,
                    backgroundColor: colorFor(entry.correlation),
                    marginLeft: entry.correlation != null && entry.correlation < 0 ? "auto" : undefined,
                  }}
                />
              </div>
              <div className="w-14 shrink-0 text-right font-tabular text-xs font-medium text-text-primary">
                {entry.correlation == null ? "—" : entry.correlation.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

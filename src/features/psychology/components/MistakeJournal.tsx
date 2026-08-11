"use client";

import { AlertOctagon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@trading-os/design-system";
import type { MistakeFrequencyResult } from "@trading-os/analytics-engine";

function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function MistakeJournal({ mistakes }: { mistakes: MistakeFrequencyResult[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mistake Journal</CardTitle>
      </CardHeader>
      <CardContent>
        {mistakes.length === 0 ? (
          <p className="text-sm text-text-muted">
            No mistakes tagged on any trades yet — that's either great discipline or an untagged blind spot.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {mistakes.map((mistake) => (
              <div key={mistake.category} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2">
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className="h-4 w-4 text-loss" />
                  <div>
                    <div className="text-sm font-medium capitalize text-text-primary">{mistake.category.replace(/_/g, " ")}</div>
                    <div className="text-xs text-text-muted">{mistake.occurrences}x</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-tabular text-sm font-semibold ${mistake.totalCostImpact >= 0 ? "text-profit" : "text-loss"}`}>
                    {formatCurrency(mistake.totalCostImpact)}
                  </div>
                  <Badge variant="neutral">{formatCurrency(mistake.averageCostImpact)} avg</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

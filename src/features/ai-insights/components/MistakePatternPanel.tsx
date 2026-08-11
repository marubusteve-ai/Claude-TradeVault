"use client";

import { Sparkles, AlertOctagon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@trading-os/design-system";
import { useDetectMistakePatterns } from "../hooks/useAIInsights";
import { ModeBadge } from "./ModeBadge";

function formatCurrency(v: number): string {
  const sign = v < 0 ? "-" : "";
  return `${sign}$${Math.abs(v).toFixed(0)}`;
}

export function MistakePatternPanel() {
  const detect = useDetectMistakePatterns();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mistake Pattern Detection</CardTitle>
        <Button size="sm" onClick={() => detect.mutate()} disabled={detect.isPending}>
          <Sparkles className="h-3.5 w-3.5" />
          {detect.isPending ? "Analyzing..." : "Analyze"}
        </Button>
      </CardHeader>
      <CardContent>
        {!detect.data ? (
          <p className="text-sm text-text-muted">Scans every closed trade tagged with a mistake and looks for patterns beyond frequency.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <ModeBadge mode={detect.data.mode} />
            </div>
            {detect.data.result.length === 0 ? (
              <p className="text-sm text-text-muted">No mistake-tagged trades found.</p>
            ) : (
              detect.data.result.map((pattern) => (
                <div key={pattern.category} className="rounded-md border border-border-subtle p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="h-4 w-4 text-loss" />
                      <span className="text-sm font-medium capitalize text-text-primary">{pattern.category.replace(/_/g, " ")}</span>
                    </div>
                    <span
                      className={`font-tabular text-sm font-semibold ${pattern.estimatedCostImpact >= 0 ? "text-profit" : "text-loss"}`}
                    >
                      {formatCurrency(pattern.estimatedCostImpact)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-text-muted">{pattern.description}</p>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

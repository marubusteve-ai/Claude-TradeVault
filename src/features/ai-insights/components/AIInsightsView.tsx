"use client";

import { Sparkles } from "lucide-react";
import { Card } from "@trading-os/design-system";
import { TradeReviewPanel } from "./TradeReviewPanel";
import { MistakePatternPanel } from "./MistakePatternPanel";
import { SetupGradePanel } from "./SetupGradePanel";
import { JournalSummaryPanel } from "./JournalSummaryPanel";

export function AIInsightsView({ aiEnabled }: { aiEnabled: boolean }) {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-text-primary">AI Insights</h1>

      {!aiEnabled && (
        <Card className="flex items-start gap-3 border-brand/30 bg-brand/5 p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <p className="text-sm text-text-secondary">
            No <code className="font-tabular">ANTHROPIC_API_KEY</code> is set, so every panel below runs on{" "}
            <code className="font-tabular">HeuristicInsightService</code> — real computed statistics, not AI. Set the key in{" "}
            <code className="font-tabular">.env.local</code> (see <code className="font-tabular">.env.example</code>) to switch to
            Claude-backed qualitative analysis with zero other code changes — both implement the exact same{" "}
            <code className="font-tabular">AIInsightService</code> port.
          </p>
        </Card>
      )}

      <TradeReviewPanel />
      <MistakePatternPanel />
      <SetupGradePanel />
      <JournalSummaryPanel />
    </div>
  );
}

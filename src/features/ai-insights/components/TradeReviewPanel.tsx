"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from "@trading-os/design-system";
import { useRecentTradesForReview, useGenerateTradeReview } from "../hooks/useAIInsights";
import { ModeBadge } from "./ModeBadge";

export function TradeReviewPanel() {
  const { data: trades = [] } = useRecentTradesForReview();
  const [tradeId, setTradeId] = React.useState<string>("");
  const generateReview = useGenerateTradeReview();

  React.useEffect(() => {
    if (!tradeId && trades.length > 0) setTradeId(trades[0]!.id);
  }, [trades, tradeId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Trade Review</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <Select value={tradeId} onValueChange={setTradeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trade" />
              </SelectTrigger>
              <SelectContent>
                {trades.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.instrument} · {t.direction} · {t.exitTime ? new Date(t.exitTime).toLocaleDateString() : "—"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" disabled={!tradeId || generateReview.isPending} onClick={() => generateReview.mutate(tradeId)}>
            <Sparkles className="h-3.5 w-3.5" />
            {generateReview.isPending ? "Reviewing..." : "Generate Review"}
          </Button>
        </div>

        {generateReview.data && (
          <div className="rounded-lg border border-border-subtle p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-tabular text-sm font-semibold text-text-primary">
                Quality Score: {generateReview.data.result.qualityScore}/100
              </span>
              <ModeBadge mode={generateReview.data.mode} />
            </div>
            <p className="text-sm text-text-secondary">{generateReview.data.result.summary}</p>

            {generateReview.data.result.strengths.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-profit">Strengths</div>
                <ul className="mt-1 list-inside list-disc text-sm text-text-secondary">
                  {generateReview.data.result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {generateReview.data.result.mistakes.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-loss">Mistakes</div>
                <ul className="mt-1 list-inside list-disc text-sm text-text-secondary">
                  {generateReview.data.result.mistakes.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {generateReview.data.result.suggestedTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {generateReview.data.result.suggestedTags.map((tag) => (
                  <Badge key={tag} variant="brand">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { BookMarked } from "lucide-react";
import { Card, Badge } from "@trading-os/design-system";
import type { StrategyPerformanceBundle } from "../lib/actions";

function scoreVariant(score: number): "profit" | "warning" | "loss" {
  if (score >= 65) return "profit";
  if (score >= 45) return "warning";
  return "loss";
}

export function StrategyCard({ bundle }: { bundle: StrategyPerformanceBundle }) {
  const { strategy, metrics, score } = bundle;

  return (
    <Link href={`/playbook/${strategy.id}`}>
      <Card className="flex h-full flex-col p-5 transition-colors hover:border-brand">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-hover">
              <BookMarked className="h-4 w-4 text-text-secondary" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">{strategy.name}</div>
              <div className="text-xs text-text-muted">{metrics.totalTrades} trades logged</div>
            </div>
          </div>
          <Badge variant={scoreVariant(score.score)}>{score.score}/100</Badge>
        </div>

        {strategy.description && <p className="mt-3 line-clamp-2 text-xs text-text-muted">{strategy.description}</p>}

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border-subtle pt-3 text-center">
          <div>
            <div className="font-tabular text-sm font-semibold text-text-primary">{(metrics.winRate * 100).toFixed(0)}%</div>
            <div className="text-[10px] uppercase tracking-wide text-text-muted">Win Rate</div>
          </div>
          <div>
            <div className="font-tabular text-sm font-semibold text-text-primary">
              {metrics.averageRMultiple != null ? `${metrics.averageRMultiple >= 0 ? "+" : ""}${metrics.averageRMultiple.toFixed(2)}R` : "—"}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-text-muted">Avg R</div>
          </div>
          <div>
            <div className="font-tabular text-sm font-semibold capitalize text-text-primary">{score.confidenceLevel}</div>
            <div className="text-[10px] uppercase tracking-wide text-text-muted">Confidence</div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

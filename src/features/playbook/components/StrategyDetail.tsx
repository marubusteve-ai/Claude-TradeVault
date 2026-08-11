"use client";

import * as React from "react";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, ProgressBar, Button } from "@trading-os/design-system";
import type { ChecklistItem } from "@trading-os/shared-types";
import type { StrategyPerformanceBundle } from "../lib/actions";
import { useCreateSetup } from "../hooks/usePlaybook";
import { getBlankStrategyFormValues } from "../lib/formDefaults";
import { StrategyForm } from "./StrategyForm";

function formatPercent(v: number): string {
  return `${(v * 100).toFixed(0)}%`;
}

function ChecklistDisplay({ title, items }: { title: string; items: ChecklistItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h4>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm text-text-secondary">
            {item.required ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            ) : (
              <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
            )}
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StrategyDetail({ bundle }: { bundle: StrategyPerformanceBundle }) {
  const { strategy, metrics, score, setups } = bundle;
  const [setupFormOpen, setSetupFormOpen] = React.useState(false);
  const createSetup = useCreateSetup(strategy.id);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">{strategy.name}</h1>
        {strategy.description && <p className="mt-1 text-sm text-text-muted">{strategy.description}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {strategy.tags.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted">Setup Score</div>
          <div className="mt-2 font-tabular text-2xl font-semibold text-text-primary">{score.score}/100</div>
          <div className="mt-1 text-xs capitalize text-text-muted">{score.confidenceLevel} confidence</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted">Win Rate</div>
          <div className="mt-2 font-tabular text-2xl font-semibold text-text-primary">{formatPercent(metrics.winRate)}</div>
          <div className="mt-1 text-xs text-text-muted">{metrics.totalTrades} trades</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted">Avg R-Multiple</div>
          <div className="mt-2 font-tabular text-2xl font-semibold text-text-primary">
            {metrics.averageRMultiple != null ? `${metrics.averageRMultiple >= 0 ? "+" : ""}${metrics.averageRMultiple.toFixed(2)}R` : "—"}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted">Net P&L</div>
          <div className={`mt-2 font-tabular text-2xl font-semibold ${metrics.netPnL >= 0 ? "text-profit" : "text-loss"}`}>
            ${metrics.netPnL.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ProgressBar
            label="Edge (expectancy-driven)"
            value={score.components.edgeScore}
            valueLabel={`${score.components.edgeScore.toFixed(0)}/100`}
            sentiment={score.components.edgeScore >= 60 ? "profit" : "warning"}
          />
          <ProgressBar
            label="Consistency (win rate + profit factor)"
            value={score.components.consistencyScore}
            valueLabel={`${score.components.consistencyScore.toFixed(0)}/100`}
            sentiment={score.components.consistencyScore >= 60 ? "profit" : "warning"}
          />
          <ProgressBar
            label="Sample size confidence"
            value={score.components.sampleSizeMultiplier * 100}
            valueLabel={`${metrics.totalTrades} trades`}
            sentiment="brand"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-5 pt-5">
            <ChecklistDisplay title="Entry Rules" items={strategy.entryRules} />
            <ChecklistDisplay title="Exit Rules" items={strategy.exitRules} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-5 pt-5">
            <ChecklistDisplay title="Confirmation Checklist" items={strategy.confirmationChecklist} />
            <ChecklistDisplay title="Invalidation Rules" items={strategy.invalidationRules} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setups ({setups.length})</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => setSetupFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Setup
          </Button>
        </CardHeader>
        <CardContent>
          {setups.length === 0 ? (
            <p className="text-sm text-text-muted">
              No setup variants yet — setups are more specific patterns within this strategy (e.g. a particular session or confluence
              combo).
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {setups.map((setup) => (
                <div key={setup.id} className="rounded-md border border-border-subtle px-3 py-2">
                  <div className="text-sm font-medium text-text-primary">{setup.name}</div>
                  {setup.description && <div className="text-xs text-text-muted">{setup.description}</div>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <StrategyForm
        open={setupFormOpen}
        onOpenChange={setSetupFormOpen}
        defaultValues={{ ...getBlankStrategyFormValues() }}
        isSubmitting={createSetup.isPending}
        title={`New Setup — ${strategy.name}`}
        onSubmit={async (values) => {
          await createSetup.mutateAsync({ ...values, strategyId: strategy.id });
          setSetupFormOpen(false);
        }}
      />
    </div>
  );
}

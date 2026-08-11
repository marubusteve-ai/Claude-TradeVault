"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@trading-os/design-system";
import type { StrategyPerformanceBundle } from "../lib/actions";
import { useCreateStrategy } from "../hooks/usePlaybook";
import { getBlankStrategyFormValues } from "../lib/formDefaults";
import { StrategyCard } from "./StrategyCard";
import { StrategyForm } from "./StrategyForm";

export function StrategyList({ bundles }: { bundles: StrategyPerformanceBundle[] }) {
  const [formOpen, setFormOpen] = React.useState(false);
  const createStrategy = useCreateStrategy();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text-primary">Playbook</h1>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          New Strategy
        </Button>
      </div>

      {bundles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-subtle p-10 text-center text-text-muted">
          No strategies yet. Define your first setup's entry, exit, and invalidation rules to start grading it against real trades.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => (
            <StrategyCard key={bundle.strategy.id} bundle={bundle} />
          ))}
        </div>
      )}

      <StrategyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultValues={getBlankStrategyFormValues()}
        isSubmitting={createStrategy.isPending}
        title="New Strategy"
        onSubmit={async (values) => {
          await createStrategy.mutateAsync(values);
          setFormOpen(false);
        }}
      />
    </div>
  );
}

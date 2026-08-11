"use client";

import { useFormContext } from "react-hook-form";
import type { CreateTradeInput } from "@trading-os/shared-types";
import { Input } from "@trading-os/design-system";

export function LinksSection() {
  const { register } = useFormContext<CreateTradeInput>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Chart Links</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Higher-Timeframe Chart" placeholder="https://..." {...register("links.higherTimeframeChart")} />
          <Input label="Entry Chart" placeholder="https://..." {...register("links.entryChart")} />
          <Input label="Exit Chart" placeholder="https://..." {...register("links.exitChart")} />
          <Input label="Outcome Chart" placeholder="https://..." {...register("links.outcomeChart")} />
        </div>
      </div>

      <div className="rounded-md border border-dashed border-border-subtle p-4 text-sm text-text-muted">
        Screenshot upload and per-user custom fields (defined once in Settings, then available on every trade form
        automatically) land with the Settings & Personalization module — the <code className="font-tabular">customFields</code>{" "}
        map on every trade record is already reserved for them, so no migration will be needed when that ships.
      </div>
    </div>
  );
}

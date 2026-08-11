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
} from "@trading-os/design-system";
import { useSummarizeJournal } from "../hooks/useAIInsights";
import { ModeBadge } from "./ModeBadge";

const PERIODS = [
  { label: "This Week", days: 7 },
  { label: "This Month", days: 30 },
  { label: "This Quarter", days: 90 },
];

export function JournalSummaryPanel() {
  const [periodIndex, setPeriodIndex] = React.useState(1);
  const summarize = useSummarizeJournal();
  const period = PERIODS[periodIndex]!;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-44">
            <Select value={String(periodIndex)} onValueChange={(v) => setPeriodIndex(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p, i) => (
                  <SelectItem key={p.label} value={String(i)}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            disabled={summarize.isPending}
            onClick={() => summarize.mutate({ periodLabel: period.label, sinceDaysAgo: period.days })}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {summarize.isPending ? "Writing..." : "Summarize"}
          </Button>
        </div>

        {summarize.data && (
          <div className="rounded-lg border border-border-subtle p-4">
            <div className="mb-2 flex justify-end">
              <ModeBadge mode={summarize.data.mode} />
            </div>
            <p className="text-sm leading-relaxed text-text-secondary">{summarize.data.result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

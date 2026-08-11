"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import type { PsychologyEntryRecord, CreatePsychologyEntryInput } from "@trading-os/shared-types";
import { Button, Card } from "@trading-os/design-system";
import type { BehavioralAnalyticsBundle } from "../lib/actions";
import { useCreatePsychologyEntry } from "../hooks/usePsychology";
import { getBlankPsychologyFormValues } from "../lib/formDefaults";
import { PsychologyEntryForm } from "./PsychologyEntryForm";
import { MoodCalendarWidget } from "./MoodCalendarWidget";
import { DisciplinePerformanceCorrelation } from "./DisciplinePerformanceCorrelation";
import { MistakeJournal } from "./MistakeJournal";

export function PsychologyView({
  initialEntries,
  analytics,
}: {
  initialEntries: PsychologyEntryRecord[];
  analytics: BehavioralAnalyticsBundle;
}) {
  const [formOpen, setFormOpen] = React.useState(false);
  const createEntry = useCreatePsychologyEntry();

  async function handleSubmit(values: CreatePsychologyEntryInput) {
    await createEntry.mutateAsync(values);
    setFormOpen(false);
  }

  const entries = analytics.entries.length > 0 ? analytics.entries : initialEntries;
  const latest = entries[entries.length - 1];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text-primary">Psychology</h1>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Daily Check-in
        </Button>
      </div>

      {latest && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(["mood", "confidence", "stress", "discipline", "patience"] as const).map((dim) => (
            <Card key={dim} className="p-3 text-center">
              <div className="text-[10px] uppercase tracking-wide text-text-muted">{dim}</div>
              <div className="mt-1 font-tabular text-xl font-semibold text-text-primary">{latest[dim] ?? "—"}</div>
            </Card>
          ))}
        </div>
      )}

      <Card className="h-80 p-4">
        <MoodCalendarWidget entries={entries} />
      </Card>

      <DisciplinePerformanceCorrelation title="Discipline vs. Performance" buckets={analytics.disciplineCorrelation} />
      <DisciplinePerformanceCorrelation title="Mood vs. Performance" buckets={analytics.moodCorrelation} />
      <MistakeJournal mistakes={analytics.mistakeFrequency} />

      <PsychologyEntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultValues={getBlankPsychologyFormValues()}
        onSubmit={handleSubmit}
        isSubmitting={createEntry.isPending}
      />
    </div>
  );
}

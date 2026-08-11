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
  ProgressBar,
} from "@trading-os/design-system";
import { useStrategiesForGrading, useGradeSetup } from "../hooks/useAIInsights";
import { ModeBadge } from "./ModeBadge";

export function SetupGradePanel() {
  const { data: strategies = [] } = useStrategiesForGrading();
  const [strategyId, setStrategyId] = React.useState("");
  const gradeSetup = useGradeSetup();

  React.useEffect(() => {
    if (!strategyId && strategies.length > 0) setStrategyId(strategies[0]!.id);
  }, [strategies, strategyId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Setup Grade</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
            <Select value={strategyId} onValueChange={setStrategyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a strategy" />
              </SelectTrigger>
              <SelectContent>
                {strategies.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" disabled={!strategyId || gradeSetup.isPending} onClick={() => gradeSetup.mutate(strategyId)}>
            <Sparkles className="h-3.5 w-3.5" />
            {gradeSetup.isPending ? "Grading..." : "Grade"}
          </Button>
        </div>

        {gradeSetup.data && (
          <div className="rounded-lg border border-border-subtle p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-tabular text-lg font-semibold text-text-primary">{gradeSetup.data.result.qualityScore}/100</span>
              <ModeBadge mode={gradeSetup.data.mode} />
            </div>
            <ProgressBar
              label="Probability"
              value={gradeSetup.data.result.probabilityScore}
              valueLabel={`${gradeSetup.data.result.probabilityScore}/100`}
              sentiment="brand"
            />
            <div className="mt-2">
              <ProgressBar
                label="Confidence"
                value={gradeSetup.data.result.confidenceScore}
                valueLabel={`${gradeSetup.data.result.confidenceScore}/100`}
                sentiment="brand"
              />
            </div>
            <p className="mt-3 text-sm text-text-secondary">{gradeSetup.data.result.rationale}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

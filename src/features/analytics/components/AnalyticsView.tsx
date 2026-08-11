"use client";

import { DimensionDrilldown } from "./DimensionDrilldown";
import { MonteCarloChart } from "./MonteCarloChart";
import { CorrelationMatrixView } from "./CorrelationMatrixView";
import { WinLossComparison } from "./WinLossComparison";

export function AnalyticsView() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-text-primary">Analytics</h1>
      <DimensionDrilldown />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WinLossComparison />
        <CorrelationMatrixView />
      </div>
      <MonteCarloChart />
    </div>
  );
}

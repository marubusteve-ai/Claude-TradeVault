"use client";

import { useQuery } from "@tanstack/react-query";
import { getDimensionDrilldownAction, getMonteCarloAction, getCorrelationMatrixAction, getWinLossComparisonAction, type DrilldownDimension } from "../lib/actions";

export function useDimensionDrilldown(dimension: DrilldownDimension) {
  return useQuery({ queryKey: ["analytics-drilldown", dimension], queryFn: () => getDimensionDrilldownAction(dimension) });
}

export function useMonteCarlo(numTradesToProject: number, riskPerTradePercentage: number) {
  return useQuery({
    queryKey: ["monte-carlo", numTradesToProject, riskPerTradePercentage],
    queryFn: () => getMonteCarloAction(numTradesToProject, riskPerTradePercentage),
  });
}

export function useCorrelationMatrix() {
  return useQuery({ queryKey: ["correlation-matrix"], queryFn: getCorrelationMatrixAction });
}

export function useWinLossComparison() {
  return useQuery({ queryKey: ["win-loss-comparison"], queryFn: getWinLossComparisonAction });
}

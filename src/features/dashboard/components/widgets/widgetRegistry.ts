import type { ComponentType } from "react";
import type { WidgetType } from "../../types";
import type { DashboardData } from "../../lib/getDashboardData";
import { KpiGridWidget } from "./KpiGridWidget";
import { EquityCurveWidget } from "./EquityCurveWidget";
import { DrawdownWidget } from "./DrawdownWidget";
import { CalendarHeatmapWidget } from "./CalendarHeatmapWidget";
import { RecentTradesWidget } from "./RecentTradesWidget";
import { WinLossWidget } from "./WinLossWidget";

export interface WidgetComponentProps {
  data: DashboardData;
}

/**
 * The single lookup every widget on the canvas renders through. Adding a
 * new widget type to the whole platform is: build the component, add one
 * line here, add one entry to WIDGET_CATALOG in ../../types.ts — the grid
 * engine, the toolbar's "add widget" menu, and layout persistence all
 * pick it up with no further changes.
 */
export const WIDGET_REGISTRY: Record<WidgetType, ComponentType<WidgetComponentProps>> = {
  "kpi-grid": KpiGridWidget,
  "equity-curve": EquityCurveWidget,
  drawdown: DrawdownWidget,
  "calendar-heatmap": CalendarHeatmapWidget,
  "recent-trades": RecentTradesWidget,
  "win-loss": WinLossWidget,
};

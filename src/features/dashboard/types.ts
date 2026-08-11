export type WidgetType = "kpi-grid" | "equity-curve" | "drawdown" | "calendar-heatmap" | "recent-trades" | "win-loss";

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  title: string;
  /** react-grid-layout position/size, in grid units. */
  layout: { x: number; y: number; w: number; h: number; minW?: number; minH?: number };
}

export interface DashboardLayoutState {
  id: string;
  name: string;
  widgets: WidgetInstance[];
}

/** The layout a fresh workspace starts with — mirrors what the "Reset layout" toolbar action restores. */
export const DEFAULT_LAYOUT: DashboardLayoutState = {
  id: "default",
  name: "Overview",
  widgets: [
    { id: "w-kpi", type: "kpi-grid", title: "Performance Overview", layout: { x: 0, y: 0, w: 12, h: 4, minW: 6, minH: 3 } },
    { id: "w-equity", type: "equity-curve", title: "Equity Curve", layout: { x: 0, y: 4, w: 8, h: 8, minW: 4, minH: 5 } },
    { id: "w-winloss", type: "win-loss", title: "Win / Loss", layout: { x: 8, y: 4, w: 4, h: 8, minW: 3, minH: 5 } },
    { id: "w-drawdown", type: "drawdown", title: "Drawdown", layout: { x: 0, y: 12, w: 8, h: 6, minW: 4, minH: 4 } },
    { id: "w-recent", type: "recent-trades", title: "Recent Trades", layout: { x: 8, y: 12, w: 4, h: 6, minW: 3, minH: 4 } },
    { id: "w-calendar", type: "calendar-heatmap", title: "Daily P&L", layout: { x: 0, y: 18, w: 12, h: 5, minW: 6, minH: 4 } },
  ],
};

export const WIDGET_CATALOG: { type: WidgetType; label: string; defaultSize: { w: number; h: number } }[] = [
  { type: "kpi-grid", label: "Performance Overview", defaultSize: { w: 12, h: 4 } },
  { type: "equity-curve", label: "Equity Curve", defaultSize: { w: 8, h: 8 } },
  { type: "drawdown", label: "Drawdown", defaultSize: { w: 8, h: 6 } },
  { type: "calendar-heatmap", label: "Daily P&L Calendar", defaultSize: { w: 12, h: 5 } },
  { type: "recent-trades", label: "Recent Trades", defaultSize: { w: 4, h: 6 } },
  { type: "win-loss", label: "Win / Loss", defaultSize: { w: 4, h: 8 } },
];

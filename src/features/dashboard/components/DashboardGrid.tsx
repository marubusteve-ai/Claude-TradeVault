"use client";

import * as React from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { WidgetInstance } from "../types";
import type { DashboardData } from "../lib/getDashboardData";
import { WidgetShell } from "./WidgetShell";
import { WIDGET_REGISTRY } from "./widgets/widgetRegistry";

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface DashboardGridProps {
  widgets: WidgetInstance[];
  data: DashboardData;
  editMode: boolean;
  onLayoutChange: (widgets: WidgetInstance[]) => void;
  onRemoveWidget: (id: string) => void;
}

export function DashboardGrid({ widgets, data, editMode, onLayoutChange, onRemoveWidget }: DashboardGridProps) {
  const layoutItems: Layout[] = widgets.map((w) => ({
    i: w.id,
    x: w.layout.x,
    y: w.layout.y,
    w: w.layout.w,
    h: w.layout.h,
    minW: w.layout.minW,
    minH: w.layout.minH,
  }));

  function handleLayoutChange(nextLayout: Layout[]) {
    const byId = new Map(nextLayout.map((item) => [item.i, item]));
    const updated = widgets.map((widget) => {
      const item = byId.get(widget.id);
      if (!item) return widget;
      return { ...widget, layout: { ...widget.layout, x: item.x, y: item.y, w: item.w, h: item.h } };
    });
    onLayoutChange(updated);
  }

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: layoutItems, md: layoutItems }}
      breakpoints={{ lg: 1024, md: 768, sm: 480, xs: 0 }}
      cols={{ lg: 12, md: 12, sm: 6, xs: 4 }}
      rowHeight={28}
      margin={[16, 16]}
      containerPadding={[0, 0]}
      isDraggable={editMode}
      isResizable={editMode}
      draggableHandle=".widget-drag-handle"
      onLayoutChange={handleLayoutChange}
      compactType="vertical"
      useCSSTransforms
    >
      {widgets.map((widget) => {
        const WidgetComponent = WIDGET_REGISTRY[widget.type];
        return (
          <div key={widget.id}>
            <WidgetShell title={widget.title} editMode={editMode} onRemove={() => onRemoveWidget(widget.id)}>
              <WidgetComponent data={data} />
            </WidgetShell>
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}

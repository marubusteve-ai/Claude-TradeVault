"use client";

import * as React from "react";
import { DEFAULT_LAYOUT, WIDGET_CATALOG, type DashboardLayoutState, type WidgetInstance, type WidgetType } from "../types";

const STORAGE_KEY = "tradeos-dashboard-layout";

function loadPersistedLayout(): DashboardLayoutState {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(raw) as DashboardLayoutState;
    if (!parsed.widgets?.length) return DEFAULT_LAYOUT;
    return parsed;
  } catch {
    return DEFAULT_LAYOUT;
  }
}

function nextGridPosition(widgets: WidgetInstance[]): number {
  return widgets.reduce((maxY, w) => Math.max(maxY, w.layout.y + w.layout.h), 0);
}

/**
 * Owns the current dashboard layout: which widgets are on the canvas, in
 * what order/size, and whether the grid is in edit mode. Persists to
 * localStorage for now — this is the one hook that gets rewired to call
 * the DashboardLayout API (backed by the `dashboard_layouts` Postgres
 * table already defined in the schema) once `apps/api` exists; nothing
 * else in the Dashboard module needs to change when that happens.
 */
export function useDashboardLayout() {
  const [layout, setLayout] = React.useState<DashboardLayoutState>(DEFAULT_LAYOUT);
  const [editMode, setEditMode] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setLayout(loadPersistedLayout());
    setHydrated(true);
  }, []);

  const persist = React.useCallback((next: DashboardLayoutState) => {
    setLayout(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Best-effort persistence — an unavailable localStorage shouldn't break editing for the session.
    }
  }, []);

  const updateWidgets = React.useCallback(
    (widgets: WidgetInstance[]) => {
      persist({ ...layout, widgets });
    },
    [layout, persist]
  );

  const addWidget = React.useCallback(
    (type: WidgetType) => {
      const catalogEntry = WIDGET_CATALOG.find((w) => w.type === type);
      if (!catalogEntry) return;
      const newWidget: WidgetInstance = {
        id: `${type}-${Date.now()}`,
        type,
        title: catalogEntry.label,
        layout: { x: 0, y: nextGridPosition(layout.widgets), w: catalogEntry.defaultSize.w, h: catalogEntry.defaultSize.h },
      };
      persist({ ...layout, widgets: [...layout.widgets, newWidget] });
    },
    [layout, persist]
  );

  const removeWidget = React.useCallback(
    (id: string) => {
      persist({ ...layout, widgets: layout.widgets.filter((w) => w.id !== id) });
    },
    [layout, persist]
  );

  const resetLayout = React.useCallback(() => {
    persist(DEFAULT_LAYOUT);
  }, [persist]);

  return {
    layout,
    hydrated,
    editMode,
    toggleEditMode: () => setEditMode((v) => !v),
    updateWidgets,
    addWidget,
    removeWidget,
    resetLayout,
  };
}

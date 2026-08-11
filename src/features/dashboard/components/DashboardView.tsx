"use client";

import { useDashboardLayout } from "../hooks/useDashboardLayout";
import { DashboardToolbar } from "./DashboardToolbar";
import { DashboardGrid } from "./DashboardGrid";
import type { DashboardData } from "../lib/getDashboardData";

export function DashboardView({ data }: { data: DashboardData }) {
  const { layout, hydrated, editMode, toggleEditMode, updateWidgets, addWidget, removeWidget, resetLayout } = useDashboardLayout();

  // Render the default layout on the very first paint (server and client
  // agree, so no hydration mismatch) and swap in the persisted layout
  // right after — the grid re-renders once, not the whole page.
  if (!hydrated) {
    return (
      <div>
        <DashboardToolbar
          layoutName={layout.name}
          editMode={false}
          onToggleEditMode={() => {}}
          onAddWidget={() => {}}
          onResetLayout={() => {}}
          presentWidgetTypes={layout.widgets.map((w) => w.type)}
        />
        <div className="h-96 animate-pulse rounded-lg border border-border bg-surface" />
      </div>
    );
  }

  return (
    <div>
      <DashboardToolbar
        layoutName={layout.name}
        editMode={editMode}
        onToggleEditMode={toggleEditMode}
        onAddWidget={addWidget}
        onResetLayout={resetLayout}
        presentWidgetTypes={layout.widgets.map((w) => w.type)}
      />
      <DashboardGrid
        widgets={layout.widgets}
        data={data}
        editMode={editMode}
        onLayoutChange={updateWidgets}
        onRemoveWidget={removeWidget}
      />
    </div>
  );
}

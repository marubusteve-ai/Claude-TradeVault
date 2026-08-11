"use client";

import { LayoutGrid, Pencil, Check, RotateCcw, Plus } from "lucide-react";
import { Button } from "@trading-os/design-system";
import { WIDGET_CATALOG, type WidgetType } from "../types";

export interface DashboardToolbarProps {
  layoutName: string;
  editMode: boolean;
  onToggleEditMode: () => void;
  onAddWidget: (type: WidgetType) => void;
  onResetLayout: () => void;
  presentWidgetTypes: WidgetType[];
}

export function DashboardToolbar({
  layoutName,
  editMode,
  onToggleEditMode,
  onAddWidget,
  onResetLayout,
  presentWidgetTypes,
}: DashboardToolbarProps) {
  const availableToAdd = WIDGET_CATALOG.filter((w) => !presentWidgetTypes.includes(w.type));

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <LayoutGrid className="h-5 w-5 text-brand" />
        <h1 className="text-lg font-semibold text-text-primary">{layoutName}</h1>
      </div>

      <div className="flex items-center gap-2">
        {editMode && (
          <>
            <div className="relative">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) onAddWidget(e.target.value as WidgetType);
                  e.target.value = "";
                }}
                disabled={availableToAdd.length === 0}
                className="h-9 appearance-none rounded-md border border-border bg-surface-raised py-0 pl-8 pr-8 text-sm text-text-primary disabled:opacity-50"
                aria-label="Add widget"
              >
                <option value="" disabled>
                  {availableToAdd.length === 0 ? "All widgets added" : "Add widget"}
                </option>
                {availableToAdd.map((w) => (
                  <option key={w.type} value={w.type}>
                    {w.label}
                  </option>
                ))}
              </select>
              <Plus className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>
            <Button variant="ghost" size="sm" onClick={onResetLayout}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </>
        )}
        <Button variant={editMode ? "primary" : "secondary"} size="sm" onClick={onToggleEditMode}>
          {editMode ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          {editMode ? "Done" : "Edit Layout"}
        </Button>
      </div>
    </div>
  );
}

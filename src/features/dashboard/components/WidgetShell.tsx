"use client";

import * as React from "react";
import { GripVertical, X } from "lucide-react";
import { cn } from "@trading-os/design-system";

export interface WidgetShellProps {
  title: string;
  editMode: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
  className?: string;
  /** Render prop for a small action (e.g. a period selector) shown next to the title, hidden in edit mode to keep the drag handle uncluttered. */
  headerAction?: React.ReactNode;
}

export function WidgetShell({ title, editMode, onRemove, children, className, headerAction }: WidgetShellProps) {
  return (
    <div className={cn("flex h-full flex-col rounded-lg border border-border bg-surface shadow-sm", className)}>
      <div className="widget-drag-handle flex shrink-0 items-center justify-between border-b border-border-subtle px-4 py-2.5 select-none">
        <div className="flex items-center gap-2 min-w-0">
          {editMode && <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-text-muted" />}
          <h3 className="truncate text-sm font-semibold text-text-primary">{title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!editMode && headerAction}
          {editMode && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${title} widget`}
              className="rounded p-1 text-text-muted transition-colors hover:bg-loss/15 hover:text-loss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden p-4">{children}</div>
    </div>
  );
}

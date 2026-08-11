import * as React from "react";
import { cn } from "../utils/cn";

export interface ProgressBarProps {
  /** 0-100. Values above 100 are visually clamped but the overflow state still renders (useful for "already over limit"). */
  value: number;
  sentiment?: "brand" | "profit" | "loss" | "warning";
  className?: string;
  label?: string;
  valueLabel?: string;
}

const SENTIMENT_CLASSES: Record<NonNullable<ProgressBarProps["sentiment"]>, string> = {
  brand: "bg-brand",
  profit: "bg-profit",
  loss: "bg-loss",
  warning: "bg-warning",
};

export function ProgressBar({ value, sentiment = "brand", className, label, valueLabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || valueLabel) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-text-secondary">{label}</span>}
          {valueLabel && <span className="font-tabular font-medium text-text-primary">{valueLabel}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover"
      >
        <div
          className={cn("h-full rounded-full transition-all duration-300 ease-os", SENTIMENT_CLASSES[sentiment], value > 100 && "bg-loss")}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

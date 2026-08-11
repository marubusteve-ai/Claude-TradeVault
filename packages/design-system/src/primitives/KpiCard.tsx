import * as React from "react";
import { cn } from "../utils/cn";
import { Card } from "./Card";

export interface KpiCardProps {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down" | "flat" };
  sentiment?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

/**
 * The atomic unit of every TradeOS dashboard: a labeled metric with an
 * optional trend indicator. Net P&L, win rate, expectancy, drawdown — all
 * render through this one component so the whole product feels of a piece,
 * and a single change here (spacing, motion, a new delta style) propagates
 * everywhere a number is shown.
 */
export function KpiCard({ label, value, delta, sentiment = "neutral", icon, className }: KpiCardProps) {
  const valueColor = sentiment === "positive" ? "text-profit" : sentiment === "negative" ? "text-loss" : "text-text-primary";

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <div className={cn("mt-2 font-tabular text-2xl font-semibold", valueColor)}>{value}</div>
      {delta && (
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            delta.direction === "up" ? "text-profit" : delta.direction === "down" ? "text-loss" : "text-text-muted"
          )}
        >
          <span>{delta.direction === "up" ? "▲" : delta.direction === "down" ? "▼" : "—"}</span>
          <span className="font-tabular">{delta.value}</span>
        </div>
      )}
    </Card>
  );
}

"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@trading-os/design-system";
import { useWinLossComparison } from "../hooks/useAnalytics";

function Row({
  label,
  winner,
  loser,
  format,
}: {
  label: string;
  winner: number | null;
  loser: number | null;
  format: (v: number) => string;
}) {
  return (
    <div className="grid grid-cols-3 items-center gap-2 border-b border-border-subtle py-2 text-sm last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className="text-right font-tabular font-medium text-profit">{winner != null ? format(winner) : "—"}</span>
      <span className="text-right font-tabular font-medium text-loss">{loser != null ? format(loser) : "—"}</span>
    </div>
  );
}

export function WinLossComparison() {
  const { data } = useWinLossComparison();
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Winners vs. Losers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 grid grid-cols-3 gap-2 text-xs font-medium uppercase tracking-wide text-text-muted">
          <span />
          <span className="text-right">Winners ({data.winners.totalTrades})</span>
          <span className="text-right">Losers ({data.losers.totalTrades})</span>
        </div>
        <Row label="Avg P&L" winner={data.winners.averageWin} loser={-data.losers.averageLoss} format={(v) => `$${v.toFixed(0)}`} />
        <Row
          label="Avg R-Multiple"
          winner={data.winners.averageRMultiple}
          loser={data.losers.averageRMultiple}
          format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}R`}
        />
        <Row
          label="Avg Duration"
          winner={data.avgWinnerDuration}
          loser={data.avgLoserDuration}
          format={(v) => (v >= 60 ? `${(v / 60).toFixed(1)}h` : `${v.toFixed(0)}m`)}
        />
        <Row
          label="Exit Efficiency"
          winner={data.avgWinnerExitEfficiency}
          loser={data.avgLoserExitEfficiency}
          format={(v) => `${(v * 100).toFixed(0)}%`}
        />
      </CardContent>
    </Card>
  );
}

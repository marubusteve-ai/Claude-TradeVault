"use client";

import Link from "next/link";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { Card, Badge, ProgressBar } from "@trading-os/design-system";
import type { AccountComplianceBundle } from "../lib/actions";

function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

const STATUS_VARIANT: Record<string, "profit" | "loss" | "warning" | "neutral"> = {
  active: "profit",
  passed: "profit",
  failed: "loss",
  breached: "loss",
  paused: "warning",
  archived: "neutral",
};

const COMPLIANCE_VARIANT: Record<string, "profit" | "loss" | "warning"> = {
  compliant: "profit",
  warning: "warning",
  breached: "loss",
};

export function AccountCard({ bundle }: { bundle: AccountComplianceBundle }) {
  const { account, report, fundingReadinessScore, currentBalance, netPnL } = bundle;
  const isPositive = netPnL >= 0;

  return (
    <Link href={`/accounts/${account.id}`}>
      <Card className="flex h-full flex-col p-5 transition-colors hover:border-brand">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-hover">
              <Wallet className="h-4 w-4 text-text-secondary" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">{account.name}</div>
              <div className="text-xs text-text-muted">{account.propFirm ?? account.broker ?? "—"}</div>
            </div>
          </div>
          <Badge variant={STATUS_VARIANT[account.status] ?? "neutral"}>{account.status}</Badge>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-xs text-text-muted">Balance</div>
            <div className="font-tabular text-xl font-semibold text-text-primary">{formatCurrency(currentBalance)}</div>
          </div>
          <div className={`flex items-center gap-1 font-tabular text-sm font-medium ${isPositive ? "text-profit" : "text-loss"}`}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {formatCurrency(netPnL)}
          </div>
        </div>

        {report && (
          <div className="mt-4 flex flex-col gap-2 border-t border-border-subtle pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Compliance</span>
              <Badge variant={COMPLIANCE_VARIANT[report.overallStatus]}>{report.overallStatus}</Badge>
            </div>
            {fundingReadinessScore != null && (
              <ProgressBar
                value={fundingReadinessScore}
                sentiment={fundingReadinessScore >= 70 ? "profit" : fundingReadinessScore >= 40 ? "warning" : "loss"}
                label="Funding readiness"
                valueLabel={`${fundingReadinessScore}/100`}
              />
            )}
          </div>
        )}
      </Card>
    </Link>
  );
}

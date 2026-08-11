"use client";

import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, Gauge } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, ProgressBar } from "@trading-os/design-system";
import type { AccountComplianceBundle } from "../lib/actions";
import type { RuleCheckStatus } from "@trading-os/domain";

function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

const STATUS_ICON: Record<RuleCheckStatus, React.ComponentType<{ className?: string }>> = {
  pass: CheckCircle2,
  warning: AlertTriangle,
  breach: XCircle,
  not_applicable: MinusCircle,
};

const STATUS_COLOR: Record<RuleCheckStatus, string> = {
  pass: "text-profit",
  warning: "text-warning",
  breach: "text-loss",
  not_applicable: "text-text-muted",
};

const STATUS_SENTIMENT: Record<RuleCheckStatus, "profit" | "warning" | "loss" | "brand"> = {
  pass: "profit",
  warning: "warning",
  breach: "loss",
  not_applicable: "brand",
};

const OVERALL_BADGE: Record<string, "profit" | "warning" | "loss"> = {
  compliant: "profit",
  warning: "warning",
  breached: "loss",
};

export function ComplianceDashboard({ bundle }: { bundle: AccountComplianceBundle }) {
  const { account, ruleSet, report, fundingReadinessScore, currentBalance, netPnL } = bundle;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted">Current Balance</div>
          <div className="mt-2 font-tabular text-2xl font-semibold text-text-primary">{formatCurrency(currentBalance)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted">Net P&L</div>
          <div className={`mt-2 font-tabular text-2xl font-semibold ${netPnL >= 0 ? "text-profit" : "text-loss"}`}>
            {formatCurrency(netPnL)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Overall Status</span>
            {report && <Badge variant={OVERALL_BADGE[report.overallStatus]}>{report.overallStatus}</Badge>}
          </div>
          {!ruleSet && <div className="mt-2 text-sm text-text-muted">No rule set configured for this account.</div>}
          {fundingReadinessScore != null && (
            <div className="mt-2 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-brand" />
              <span className="font-tabular text-2xl font-semibold text-text-primary">{fundingReadinessScore}</span>
              <span className="text-xs text-text-muted">/ 100 funding readiness</span>
            </div>
          )}
        </Card>
      </div>

      {ruleSet && report && (
        <Card>
          <CardHeader>
            <CardTitle>{ruleSet.name}</CardTitle>
            <span className="text-xs text-text-muted">{ruleSet.firmName}</span>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {report.checks.map((check) => {
              const Icon = STATUS_ICON[check.status];
              const ratio = check.limitValue ? Math.min(150, (check.currentValue / check.limitValue) * 100) : 0;
              return (
                <div key={check.ruleId} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${STATUS_COLOR[check.status]}`} />
                      <span className="text-sm font-medium text-text-primary">{check.label}</span>
                    </div>
                    <Badge variant={STATUS_SENTIMENT[check.status]}>{check.status.replace("_", " ")}</Badge>
                  </div>
                  <p className="pl-6 text-xs text-text-muted">{check.detail}</p>
                  {check.limitValue != null && (
                    <div className="pl-6">
                      <ProgressBar
                        value={ratio}
                        sentiment={check.status === "breach" ? "loss" : check.status === "warning" ? "warning" : "profit"}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="p-4 text-xs text-text-muted">
        Account: {account.name} · {account.propFirm ?? account.broker ?? "No broker set"} · Opened{" "}
        {new Date(account.createdAt).toLocaleDateString()}
      </Card>
    </div>
  );
}

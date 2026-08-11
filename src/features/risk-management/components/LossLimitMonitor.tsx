"use client";

import { Card, CardHeader, CardTitle, CardContent, ProgressBar, Badge } from "@trading-os/design-system";
import type { AccountRiskStatus } from "../lib/actions";

function sentimentFor(status: string): "profit" | "warning" | "loss" {
  if (status === "breach") return "loss";
  if (status === "warning") return "warning";
  return "profit";
}

export function LossLimitMonitor({ accounts }: { accounts: AccountRiskStatus[] }) {
  if (accounts.length === 0) {
    return <Card className="p-6 text-center text-sm text-text-muted">No accounts have a rule set configured to monitor yet.</Card>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {accounts.map((account) => (
        <Card key={account.accountId}>
          <CardHeader>
            <CardTitle>{account.accountName}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {account.checks.length === 0 ? (
              <p className="text-sm text-text-muted">No loss-limit or drawdown rules configured for this account.</p>
            ) : (
              account.checks.map((check) => {
                const ratio = check.limitValue ? Math.min(150, (check.currentValue / check.limitValue) * 100) : 0;
                return (
                  <div key={check.ruleId} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{check.label}</span>
                      <Badge variant={sentimentFor(check.status)}>{check.status}</Badge>
                    </div>
                    <ProgressBar value={ratio} sentiment={sentimentFor(check.status)} valueLabel={check.detail} />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

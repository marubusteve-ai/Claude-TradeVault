"use client";

import * as React from "react";
import { FileText, FileSpreadsheet, FileJson, Download } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@trading-os/design-system";
import type { TradingAccountRecord } from "@trading-os/shared-types";

interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  format: "PDF" | "Excel" | "JSON";
  icon: React.ComponentType<{ className?: string }>;
  href: (accountId: string) => string;
  requiresRuleSet?: boolean;
}

const REPORTS: ReportDefinition[] = [
  {
    id: "performance",
    title: "Performance Report",
    description: "Executive-summary style overview: KPIs, performance by strategy, performance by instrument, streaks.",
    format: "PDF",
    icon: FileText,
    href: (accountId) => `/api/reports/performance?accountId=${accountId}`,
  },
  {
    id: "compliance",
    title: "Prop Firm Compliance Report",
    description: "Every rule check from the compliance dashboard, formatted for sharing or record-keeping.",
    format: "PDF",
    icon: FileText,
    href: (accountId) => `/api/reports/compliance?accountId=${accountId}`,
    requiresRuleSet: true,
  },
  {
    id: "tax-summary",
    title: "Tax Summary",
    description: "Realized gains/losses by quarter. Informational only — not tax advice.",
    format: "Excel",
    icon: FileSpreadsheet,
    href: (accountId) => `/api/reports/tax-summary?accountId=${accountId}&year=${new Date().getFullYear()}`,
  },
  {
    id: "trade-history-excel",
    title: "Trade History (Excel)",
    description: "Every trade with computed net P&L and R-multiple, formatted and filterable.",
    format: "Excel",
    icon: FileSpreadsheet,
    href: (accountId) => `/api/reports/trade-history?accountId=${accountId}&format=excel`,
  },
  {
    id: "trade-history-json",
    title: "Trade History (JSON)",
    description: "Full trade records plus computed fields, for programmatic use or backup.",
    format: "JSON",
    icon: FileJson,
    href: (accountId) => `/api/reports/trade-history?accountId=${accountId}&format=json`,
  },
];

export function ReportsView({ accounts }: { accounts: TradingAccountRecord[] }) {
  const [accountId, setAccountId] = React.useState(accounts[0]?.id ?? "");
  const selectedAccount = accounts.find((a) => a.id === accountId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-text-primary">Reports</h1>
        <div className="w-64">
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => {
          const disabled = report.requiresRuleSet && !selectedAccount?.ruleSetId;
          return (
            <Card key={report.id} className="flex flex-col p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-hover">
                  <report.icon className="h-4 w-4 text-text-secondary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">{report.title}</div>
                  <div className="text-xs uppercase tracking-wide text-text-muted">{report.format}</div>
                </div>
              </div>
              <p className="mt-3 flex-1 text-xs text-text-muted">{report.description}</p>
              {disabled ? (
                <Button variant="secondary" size="sm" className="mt-4" disabled title="This account has no rule set configured">
                  <Download className="h-3.5 w-3.5" />
                  No Rule Set
                </Button>
              ) : (
                <Button asChild variant="secondary" size="sm" className="mt-4">
                  <a href={report.href(accountId)} download>
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">
            Broker summaries, strategy reports, and psychology reports follow the same pattern established here — a data-gathering
            function reusing existing domain/analytics-engine logic, plus a PDF or Excel renderer. CSV export already exists in the
            Trade Journal for quick, unstyled exports; these reports are the formatted, presentation-ready counterpart.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

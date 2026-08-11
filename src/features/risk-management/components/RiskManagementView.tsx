"use client";

import type { AccountRiskStatus } from "../lib/actions";
import { RiskCalculatorPanel } from "./RiskCalculatorPanel";
import { LossLimitMonitor } from "./LossLimitMonitor";
import { AlertsPanel } from "./AlertsPanel";

export function RiskManagementView({ accounts }: { accounts: AccountRiskStatus[] }) {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-text-primary">Risk Management Center</h1>
      <LossLimitMonitor accounts={accounts} />
      <RiskCalculatorPanel />
      <AlertsPanel />
    </div>
  );
}

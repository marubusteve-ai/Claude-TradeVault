"use client";

import * as React from "react";
import { RiskEngine } from "@trading-os/domain";
import { Card, CardHeader, CardTitle, CardContent, Input, Tabs, TabsList, TabsTrigger, TabsContent } from "@trading-os/design-system";

const riskEngine = new RiskEngine();

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function NumberField({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-text-secondary">
        {label}
        {suffix && <span className="text-text-muted"> ({suffix})</span>}
      </label>
      <Input type="number" step="any" value={Number.isNaN(value) ? "" : value} onChange={(e) => onChange(e.target.valueAsNumber)} />
    </div>
  );
}

function PositionSizeCalculator() {
  const [balance, setBalance] = React.useState(100000);
  const [riskPct, setRiskPct] = React.useState(1);
  const [entry, setEntry] = React.useState(5900);
  const [stop, setStop] = React.useState(5885);
  const [multiplier, setMultiplier] = React.useState(50);

  const result = riskEngine.calculatePositionSize({
    accountBalance: balance,
    riskPercentage: riskPct,
    entryPrice: entry,
    stopLossPrice: stop,
    contractMultiplier: multiplier,
  });

  const margin = riskEngine.calculateMargin({ positionSize: result.positionSize, price: entry, leverage: 20, contractMultiplier: multiplier });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="grid grid-cols-2 gap-4">
        <NumberField label="Account Balance" value={balance} onChange={setBalance} suffix="$" />
        <NumberField label="Risk per Trade" value={riskPct} onChange={setRiskPct} suffix="%" />
        <NumberField label="Entry Price" value={entry} onChange={setEntry} />
        <NumberField label="Stop-Loss Price" value={stop} onChange={setStop} />
        <NumberField label="Contract Multiplier" value={multiplier} onChange={setMultiplier} />
      </div>
      <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-hover p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Risk Amount</span>
          <span className="font-tabular text-sm font-semibold text-loss">{formatCurrency(result.riskAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Position Size</span>
          <span className="font-tabular text-sm font-semibold text-text-primary">{result.positionSize.toFixed(4)} units</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Notional Value</span>
          <span className="font-tabular text-sm font-semibold text-text-primary">{formatCurrency(margin.notionalValue)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border-subtle pt-3">
          <span className="text-xs text-text-muted">Margin Required (20:1)</span>
          <span className="font-tabular text-sm font-semibold text-brand">{formatCurrency(margin.marginRequired)}</span>
        </div>
      </div>
    </div>
  );
}

function LotSizeCalculator() {
  const [balance, setBalance] = React.useState(100000);
  const [riskPct, setRiskPct] = React.useState(1);
  const [stopPips, setStopPips] = React.useState(25);
  const [pipValue, setPipValue] = React.useState(10);

  const result = riskEngine.calculateLotSize({ accountBalance: balance, riskPercentage: riskPct, stopLossPips: stopPips, pipValuePerStandardLot: pipValue });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="grid grid-cols-2 gap-4">
        <NumberField label="Account Balance" value={balance} onChange={setBalance} suffix="$" />
        <NumberField label="Risk per Trade" value={riskPct} onChange={setRiskPct} suffix="%" />
        <NumberField label="Stop-Loss" value={stopPips} onChange={setStopPips} suffix="pips" />
        <NumberField label="Pip Value / Standard Lot" value={pipValue} onChange={setPipValue} suffix="$" />
      </div>
      <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-hover p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Risk Amount</span>
          <span className="font-tabular text-sm font-semibold text-loss">{formatCurrency(result.riskAmount)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border-subtle pt-3">
          <span className="text-xs text-text-muted">Lot Size</span>
          <span className="font-tabular text-lg font-semibold text-brand">{result.lotSize.toFixed(2)} lots</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Pip Value at This Size</span>
          <span className="font-tabular text-sm font-semibold text-text-primary">{formatCurrency(result.pipValueAtSize)}</span>
        </div>
      </div>
    </div>
  );
}

export function RiskCalculatorPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="position">
          <TabsList>
            <TabsTrigger value="position">Position Size & Margin</TabsTrigger>
            <TabsTrigger value="lots">Forex Lot Size</TabsTrigger>
          </TabsList>
          <TabsContent value="position">
            <PositionSizeCalculator />
          </TabsContent>
          <TabsContent value="lots">
            <LotSizeCalculator />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

"use client";

import * as React from "react";
import { Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Drawer, DrawerContent, Button, Badge } from "@trading-os/design-system";
import type { CreateTradeInput } from "@trading-os/shared-types";
import { parseCsvToTrades, type CsvImportResult } from "../lib/csvImport";

export interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  onConfirmImport: (trades: CreateTradeInput[]) => Promise<void>;
}

export function CsvImportDialog({ open, onOpenChange, accountId, onConfirmImport }: CsvImportDialogProps) {
  const [result, setResult] = React.useState<CsvImportResult | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);

  async function handleFile(file: File) {
    const text = await file.text();
    setFileName(file.name);
    setResult(parseCsvToTrades(text, accountId));
  }

  async function handleConfirm() {
    if (!result?.validTrades.length) return;
    setIsImporting(true);
    try {
      await onConfirmImport(result.validTrades);
      setResult(null);
      setFileName(null);
      onOpenChange(false);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent title="Import Trades from CSV" description="Broker or platform exports — column names are matched flexibly." size="md">
        <div className="flex h-full flex-col gap-4">
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border-subtle p-8 text-center transition-colors hover:border-brand">
            <Upload className="h-6 w-6 text-text-muted" />
            <span className="text-sm text-text-secondary">{fileName ?? "Click to choose a .csv file"}</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </label>

          {result && (
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="profit" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {result.validTrades.length} ready
                </Badge>
                {result.errors.length > 0 && (
                  <Badge variant="loss" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {result.errors.length} skipped
                  </Badge>
                )}
                <span className="text-text-muted">of {result.totalRows} rows</span>
              </div>

              {result.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-md border border-border-subtle p-2">
                  {result.errors.map((err) => (
                    <div key={err.row} className="border-b border-border-subtle py-1 text-xs text-text-muted last:border-0">
                      Row {err.row}: {err.message}
                    </div>
                  ))}
                </div>
              )}

              {result.validTrades.length > 0 && (
                <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border-subtle">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-surface-raised">
                      <tr>
                        <th className="px-2 py-1.5 text-left text-text-muted">Instrument</th>
                        <th className="px-2 py-1.5 text-left text-text-muted">Direction</th>
                        <th className="px-2 py-1.5 text-left text-text-muted">Exit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.validTrades.slice(0, 25).map((t, i) => (
                        <tr key={i} className="border-t border-border-subtle">
                          <td className="px-2 py-1.5">{t.instrument || "—"}</td>
                          <td className="px-2 py-1.5">{t.direction}</td>
                          <td className="px-2 py-1.5">{t.exitTime ? new Date(t.exitTime).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.validTrades.length > 25 && (
                    <div className="px-2 py-1.5 text-center text-text-muted">+ {result.validTrades.length - 25} more</div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-auto flex shrink-0 justify-end gap-2 border-t border-border-subtle pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!result?.validTrades.length || isImporting} onClick={handleConfirm}>
              {isImporting ? "Importing..." : `Import ${result?.validTrades.length ?? 0} trades`}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

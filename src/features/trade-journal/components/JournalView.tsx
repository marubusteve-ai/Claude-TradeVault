"use client";

import * as React from "react";
import { Plus, Upload, Download } from "lucide-react";
import type { TradeRecord, CreateTradeInput } from "@trading-os/shared-types";
import { Button } from "@trading-os/design-system";
import { useTrades, useCreateTrade, useUpdateTrade, useDeleteTrade, useCreateManyTrades } from "../hooks/useTrades";
import { TradeTable } from "./TradeTable/TradeTable";
import { TradeDrawer } from "./TradeDrawer";
import { CsvImportDialog } from "./CsvImportDialog";
import { tradesToCsv, downloadCsv } from "../lib/csvExport";

export function JournalView({ accountId, initialTrades }: { accountId: string; initialTrades: TradeRecord[] }) {
  const { data: trades = initialTrades } = useTrades(accountId);
  const createTrade = useCreateTrade(accountId);
  const createManyTrades = useCreateManyTrades(accountId);
  const updateTrade = useUpdateTrade(accountId);
  const deleteTrade = useDeleteTrade(accountId);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [editingTrade, setEditingTrade] = React.useState<TradeRecord | null>(null);

  function openNewTradeDrawer() {
    setEditingTrade(null);
    setDrawerOpen(true);
  }

  function openEditDrawer(trade: TradeRecord) {
    setEditingTrade(trade);
    setDrawerOpen(true);
  }

  async function handleFormSubmit(values: CreateTradeInput) {
    if (editingTrade) {
      await updateTrade.mutateAsync({ id: editingTrade.id, input: values });
    } else {
      await createTrade.mutateAsync(values);
    }
    setDrawerOpen(false);
  }

  function handleExport() {
    downloadCsv(`trades-${new Date().toISOString().slice(0, 10)}.csv`, tradesToCsv(trades));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-text-primary">Trade Journal</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="h-3.5 w-3.5" />
            Import CSV
          </Button>
          <Button size="sm" onClick={openNewTradeDrawer}>
            <Plus className="h-3.5 w-3.5" />
            New Trade
          </Button>
        </div>
      </div>

      <TradeTable trades={trades} onEdit={openEditDrawer} onDelete={(id) => deleteTrade.mutate(id)} />

      <TradeDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        accountId={accountId}
        editingTrade={editingTrade}
        onSubmit={handleFormSubmit}
        isSubmitting={createTrade.isPending || updateTrade.isPending}
      />

      <CsvImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        accountId={accountId}
        onConfirmImport={(rows) => createManyTrades.mutateAsync(rows)}
      />
    </div>
  );
}

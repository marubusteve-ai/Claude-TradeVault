"use client";

import * as React from "react";
import { Plus, Receipt } from "lucide-react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Drawer, DrawerContent } from "@trading-os/design-system";
import type { PayoutRecord } from "@trading-os/shared-types";
import { usePayouts, useCreatePayout } from "../hooks/useAccounts";

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

interface PayoutFormValues {
  grossAmount: number;
  splitPercentage: number;
  payoutDate: string;
  notes: string;
}

export function PayoutList({ accountId }: { accountId: string }) {
  const { data: payouts = [] } = usePayouts(accountId);
  const createPayout = useCreatePayout(accountId);
  const [open, setOpen] = React.useState(false);

  const { register, handleSubmit, reset } = useForm<PayoutFormValues>({
    defaultValues: { grossAmount: 0, splitPercentage: 80, payoutDate: new Date().toISOString().slice(0, 10), notes: "" },
  });

  async function onSubmit(values: PayoutFormValues) {
    const netAmount = values.grossAmount * (values.splitPercentage / 100);
    await createPayout.mutateAsync({
      accountId,
      grossAmount: values.grossAmount,
      splitPercentage: values.splitPercentage,
      netAmount,
      payoutDate: new Date(values.payoutDate).toISOString(),
      notes: values.notes || undefined,
    });
    reset();
    setOpen(false);
  }

  const totalNet = payouts.reduce((sum: number, p: PayoutRecord) => sum + p.netAmount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payouts</CardTitle>
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Payout
        </Button>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <p className="text-sm text-text-muted">No payouts recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="mb-2 text-xs text-text-muted">
              Total received: <span className="font-tabular font-semibold text-profit">{formatCurrency(totalNet)}</span>
            </div>
            {payouts.map((payout: PayoutRecord) => (
              <div key={payout.id} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2">
                <div className="flex items-center gap-2.5">
                  <Receipt className="h-4 w-4 text-text-muted" />
                  <div>
                    <div className="text-sm text-text-primary">{new Date(payout.payoutDate).toLocaleDateString()}</div>
                    {payout.notes && <div className="text-xs text-text-muted">{payout.notes}</div>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-tabular text-sm font-semibold text-profit">{formatCurrency(payout.netAmount)}</div>
                  <div className="text-xs text-text-muted">
                    {formatCurrency(payout.grossAmount)} gross · {payout.splitPercentage}% split
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent title="Record Payout" size="md">
          <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col gap-4">
            <Input label="Gross Amount ($)" type="number" step="any" {...register("grossAmount", { valueAsNumber: true })} />
            <Input label="Split %" type="number" step="any" {...register("splitPercentage", { valueAsNumber: true })} />
            <Input label="Payout Date" type="date" {...register("payoutDate")} />
            <Input label="Notes" {...register("notes")} />
            <div className="mt-auto flex justify-end gap-2 border-t border-border-subtle pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPayout.isPending}>
                {createPayout.isPending ? "Saving..." : "Save Payout"}
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}

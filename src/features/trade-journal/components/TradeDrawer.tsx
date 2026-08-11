"use client";

import { Drawer, DrawerContent } from "@trading-os/design-system";
import type { CreateTradeInput, TradeRecord } from "@trading-os/shared-types";
import { TradeForm } from "./TradeForm/TradeForm";
import { getBlankTradeFormValues, tradeRecordToFormValues } from "../lib/formDefaults";

export interface TradeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  editingTrade: TradeRecord | null;
  onSubmit: (values: CreateTradeInput) => Promise<void>;
  isSubmitting: boolean;
}

export function TradeDrawer({ open, onOpenChange, accountId, editingTrade, onSubmit, isSubmitting }: TradeDrawerProps) {
  const defaultValues = editingTrade ? tradeRecordToFormValues(editingTrade) : getBlankTradeFormValues(accountId);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        title={editingTrade ? `Edit Trade — ${editingTrade.instrument}` : "New Trade"}
        description="Every field is optional except instrument and direction — fill in what you track."
        size="xl"
      >
        <TradeForm
          key={editingTrade?.id ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={editingTrade ? "Update Trade" : "Add Trade"}
          isSubmitting={isSubmitting}
        />
      </DrawerContent>
    </Drawer>
  );
}

"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { CreateTradeInput } from "@trading-os/shared-types";
import { Input, Button, Checkbox } from "@trading-os/design-system";

export function ExecutionRiskSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateTradeInput>();

  const { fields, append, remove } = useFieldArray({ control, name: "takeProfitLevels" });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Execution</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Entry Price" type="number" step="any" {...register("entryPrice", { valueAsNumber: true })} error={errors.entryPrice?.message} />
          <Input label="Exit Price" type="number" step="any" {...register("exitPrice", { valueAsNumber: true })} error={errors.exitPrice?.message} />
          <Input label="Quantity / Size" type="number" step="any" {...register("quantity", { valueAsNumber: true })} error={errors.quantity?.message} />
          <Input
            label="Contract Multiplier"
            type="number"
            step="any"
            placeholder="1"
            {...register("contractMultiplier", { valueAsNumber: true })}
          />
          <Input label="Commission" type="number" step="any" {...register("commission", { valueAsNumber: true })} />
          <Input label="Swap" type="number" step="any" {...register("swap", { valueAsNumber: true })} />
          <Input label="Spread" type="number" step="any" {...register("spread", { valueAsNumber: true })} />
          <Input label="Slippage (price)" type="number" step="any" {...register("slippagePrice", { valueAsNumber: true })} />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Stop Loss</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="SL Price" type="number" step="any" {...register("stopLossPrice", { valueAsNumber: true })} />
          <Input label="SL Pips" type="number" step="any" {...register("stopLossPips", { valueAsNumber: true })} />
          <Input label="SL Amount ($)" type="number" step="any" {...register("stopLossAmount", { valueAsNumber: true })} />
          <Input label="Risk Amount ($) override" type="number" step="any" {...register("riskAmount", { valueAsNumber: true })} />
          <Input label="SL Reason" className="sm:col-span-2 lg:col-span-4" {...register("stopLossReason")} />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Take Profit Levels</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => append({ id: `tp-${Date.now()}`, price: 0, quantityPercentage: 100, hit: false })}
          >
            <Plus className="h-3.5 w-3.5" />
            Add level
          </Button>
        </div>
        {fields.length === 0 && <p className="text-sm text-text-muted">No take-profit levels added — single-target trades can skip this.</p>}
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-3 rounded-md border border-border-subtle p-3">
              <Input label="Price" type="number" step="any" {...register(`takeProfitLevels.${index}.price`, { valueAsNumber: true })} />
              <Input
                label="Size %"
                type="number"
                step="any"
                {...register(`takeProfitLevels.${index}.quantityPercentage`, { valueAsNumber: true })}
              />
              <Input label="Reason" className="flex-1" {...register(`takeProfitLevels.${index}.reason`)} />
              <div className="flex items-center gap-2 pb-2">
                <Controller
                  control={control}
                  name={`takeProfitLevels.${index}.hit`}
                  render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                />
                <span className="text-xs text-text-secondary">Hit</span>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove level">
                <Trash2 className="h-4 w-4 text-loss" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

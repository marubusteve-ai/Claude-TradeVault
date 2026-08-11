"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { CreateTradeInput } from "@trading-os/shared-types";
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@trading-os/design-system";
import { ASSET_CLASSES, SESSIONS, MARKET_CONDITIONS, TIMEFRAMES, TRADE_DIRECTIONS, TRADE_STATUSES } from "../../../lib/formDefaults";
import type { DEMO_STRATEGIES } from "@/lib/demo-data";

export function CoreDetailsSection({ strategies }: { strategies: typeof DEMO_STRATEGIES }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateTradeInput>();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Input label="Instrument" placeholder="EURUSD, ES, AAPL..." {...register("instrument")} error={errors.instrument?.message} />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary">Asset Class</label>
        <Controller
          control={control}
          name="assetClass"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_CLASSES.map((ac) => (
                  <SelectItem key={ac} value={ac}>
                    {ac.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary">Direction</label>
        <Controller
          control={control}
          name="direction"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRADE_DIRECTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === "long" ? "Long / Buy" : "Short / Sell"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary">Session</label>
        <Controller
          control={control}
          name="session"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {SESSIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary">Timeframe</label>
        <Controller
          control={control}
          name="timeframe"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                {TIMEFRAMES.map((tf) => (
                  <SelectItem key={tf} value={tf}>
                    {tf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary">Market Condition</label>
        <Controller
          control={control}
          name="marketCondition"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {MARKET_CONDITIONS.map((mc) => (
                  <SelectItem key={mc} value={mc}>
                    {mc.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary">Strategy</label>
        <Controller
          control={control}
          name="strategyId"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                {strategies.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Input label="Entry Time" type="datetime-local" {...register("entryTime")} error={errors.entryTime?.message} />
      <Input label="Exit Time" type="datetime-local" {...register("exitTime")} error={errors.exitTime?.message} />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary">Status</label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRADE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  );
}

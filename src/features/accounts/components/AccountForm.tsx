"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateAccountInputSchema, type CreateAccountInput, AccountTypeSchema, AccountStatusSchema } from "@trading-os/shared-types";
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, Drawer, DrawerContent } from "@trading-os/design-system";
import type { PropFirmRuleSetRecord } from "@trading-os/shared-types";

export interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: CreateAccountInput;
  ruleSets: PropFirmRuleSetRecord[];
  onSubmit: (values: CreateAccountInput) => Promise<void>;
  isSubmitting: boolean;
  title: string;
}

export function AccountForm({ open, onOpenChange, defaultValues, ruleSets, onSubmit, isSubmitting, title }: AccountFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountInput>({ resolver: zodResolver(CreateAccountInputSchema), defaultValues });

  async function handleValidSubmit(values: CreateAccountInput) {
    await onSubmit(values);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent title={title} size="md">
        <form onSubmit={handleSubmit(handleValidSubmit)} className="flex h-full flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            <Input label="Account Name" {...register("name")} error={errors.name?.message} />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Account Type</label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AccountTypeSchema.options.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
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
                        {AccountStatusSchema.options.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Broker" {...register("broker")} />
              <Input label="Prop Firm" {...register("propFirm")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Platform" placeholder="MT5, Tradovate..." {...register("platform")} />
              <Input label="Challenge Phase" placeholder="phase_1, funded..." {...register("challengePhase")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Starting Balance"
                type="number"
                step="any"
                {...register("startingBalance", { valueAsNumber: true })}
                error={errors.startingBalance?.message}
              />
              <Input label="Currency" {...register("currency")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Rule Set</label>
              <Controller
                control={control}
                name="ruleSetId"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="None — track without prop-firm rules" />
                    </SelectTrigger>
                    <SelectContent>
                      {ruleSets.map((rs) => (
                        <SelectItem key={rs.id} value={rs.id}>
                          {rs.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <Input label="Timezone" placeholder="America/New_York" {...register("timezone")} />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border-subtle pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Account"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

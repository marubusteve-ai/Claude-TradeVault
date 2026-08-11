"use client";

import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateStrategyInputSchema, type CreateStrategyInput, ASSET_CLASSES } from "@trading-os/shared-types";
import { Input, Textarea, TagInput, Button, Drawer, DrawerContent } from "@trading-os/design-system";
import { ChecklistField } from "./ChecklistField";

export interface StrategyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: CreateStrategyInput;
  onSubmit: (values: CreateStrategyInput) => Promise<void>;
  isSubmitting: boolean;
  title: string;
}

export function StrategyForm({ open, onOpenChange, defaultValues, onSubmit, isSubmitting, title }: StrategyFormProps) {
  const methods = useForm<CreateStrategyInput>({ resolver: zodResolver(CreateStrategyInputSchema), defaultValues });
  const { register, control, handleSubmit } = methods;

  async function handleValidSubmit(values: CreateStrategyInput) {
    await onSubmit(values);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent title={title} size="lg">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleValidSubmit)} className="flex h-full flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto pb-4">
              <Input label="Name" placeholder="London Breakout..." {...register("name")} />
              <Textarea label="Description" rows={2} {...register("description")} />

              <Controller
                control={control}
                name="assetClasses"
                render={({ field }) => (
                  <TagInput label="Asset Classes" value={field.value} onChange={field.onChange} suggestions={[...ASSET_CLASSES]} />
                )}
              />

              <ChecklistField name="entryRules" label="Entry Rules" helperText="What has to be true to take this trade" />
              <ChecklistField name="exitRules" label="Exit Rules" helperText="How targets and management work" />
              <ChecklistField name="confirmationChecklist" label="Confirmation Checklist" helperText="Confluence that strengthens the signal" />
              <ChecklistField name="invalidationRules" label="Invalidation Rules" helperText="What proves the setup wrong" />

              <Controller
                control={control}
                name="tags"
                render={({ field }) => <TagInput label="Tags" value={field.value} onChange={field.onChange} />}
              />
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border-subtle pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Strategy"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DrawerContent>
    </Drawer>
  );
}

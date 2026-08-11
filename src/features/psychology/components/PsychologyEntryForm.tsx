"use client";

import { Controller, useForm } from "react-hook-form";
import type { CreatePsychologyEntryInput } from "@trading-os/shared-types";
import { Slider, Textarea, TagInput, Button, Drawer, DrawerContent } from "@trading-os/design-system";
import { EMOTIONAL_TAGS } from "@trading-os/shared-types";

export interface PsychologyEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: CreatePsychologyEntryInput;
  onSubmit: (values: CreatePsychologyEntryInput) => Promise<void>;
  isSubmitting: boolean;
}

const DIMENSIONS: { key: "mood" | "confidence" | "stress" | "discipline" | "patience"; label: string }[] = [
  { key: "mood", label: "Mood" },
  { key: "confidence", label: "Confidence" },
  { key: "stress", label: "Stress" },
  { key: "discipline", label: "Discipline" },
  { key: "patience", label: "Patience" },
];

export function PsychologyEntryForm({ open, onOpenChange, defaultValues, onSubmit, isSubmitting }: PsychologyEntryFormProps) {
  const { control, register, handleSubmit } = useForm<CreatePsychologyEntryInput>({ defaultValues });

  async function handleValidSubmit(values: CreatePsychologyEntryInput) {
    await onSubmit(values);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent title="Daily Check-in" description="How today actually felt, in your own numbers." size="md">
        <form onSubmit={handleSubmit(handleValidSubmit)} className="flex h-full flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto pb-4">
            {DIMENSIONS.map(({ key, label }) => (
              <Controller
                key={key}
                control={control}
                name={key}
                render={({ field }) => (
                  <Slider
                    label={label}
                    valueLabel={`${field.value ?? 5}/10`}
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value ?? 5]}
                    onValueChange={(v: number[]) => field.onChange(v[0])}
                  />
                )}
              />
            ))}

            <Controller
              control={control}
              name="ruleAdherencePercentage"
              render={({ field }) => (
                <Slider
                  label="Rule Adherence"
                  valueLabel={`${field.value ?? 80}%`}
                  min={0}
                  max={100}
                  step={5}
                  value={[field.value ?? 80]}
                  onValueChange={(v: number[]) => field.onChange(v[0])}
                />
              )}
            />

            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagInput label="Tags" value={field.value} onChange={field.onChange} suggestions={[...EMOTIONAL_TAGS]} variant="brand" />
              )}
            />

            <Textarea label="Notes" placeholder="What shaped today's state..." rows={3} {...register("notes")} />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border-subtle pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Check-in"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

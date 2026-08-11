"use client";

import { useFieldArray, useFormContext, Controller, type FieldArrayPath } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { CreateStrategyInput } from "@trading-os/shared-types";
import { Input, Button, Checkbox } from "@trading-os/design-system";

export interface ChecklistFieldProps {
  name: FieldArrayPath<CreateStrategyInput>;
  label: string;
  helperText?: string;
}

/**
 * One editor powers every checklist on the Strategy/Setup form — entry
 * rules, exit rules, confirmation checklist, invalidation rules all have
 * the identical { id, label, required } shape, so this component takes
 * the field name and renders the same add/remove/required-toggle UI for
 * whichever checklist it's pointed at.
 */
export function ChecklistField({ name, label, helperText }: ChecklistFieldProps) {
  const { register, control } = useFormContext<CreateStrategyInput>();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</h4>
          {helperText && <p className="text-xs text-text-muted">{helperText}</p>}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ id: `${name}-${Date.now()}`, label: "", required: false })}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      {fields.length === 0 && <p className="text-sm text-text-muted">No items yet.</p>}
      <div className="flex flex-col gap-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Controller
              control={control}
              name={`${name}.${index}.required` as const}
              render={({ field: checkboxField }) => (
                <Checkbox checked={Boolean(checkboxField.value)} onCheckedChange={checkboxField.onChange} />
              )}
            />
            <Input className="flex-1" placeholder="Checklist item..." {...register(`${name}.${index}.label` as const)} />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove item">
              <Trash2 className="h-4 w-4 text-loss" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

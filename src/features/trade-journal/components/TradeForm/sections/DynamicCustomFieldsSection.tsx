"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { CreateTradeInput } from "@trading-os/shared-types";
import { Input, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, TagInput } from "@trading-os/design-system";
import { useCustomFields } from "@/features/settings/hooks/useSettings";

export function DynamicCustomFieldsSection() {
  const { data: fields = [] } = useCustomFields("trade");
  const { control, register } = useFormContext<CreateTradeInput>();

  if (fields.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        No custom fields defined yet. Add one in Settings → Custom Fields and it appears here immediately, on every trade form, with
        no code change.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const name = `customFields.${field.id}` as const;

        switch (field.type) {
          case "boolean":
            return (
              <div key={field.id} className="flex items-center gap-2">
                <Controller
                  control={control}
                  name={name}
                  render={({ field: rhf }) => <Checkbox checked={Boolean(rhf.value)} onCheckedChange={rhf.onChange} />}
                />
                <span className="text-sm text-text-secondary">
                  {field.label}
                  {field.required && <span className="ml-1 text-loss">*</span>}
                </span>
              </div>
            );

          case "select":
            return (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">{field.label}</label>
                <Controller
                  control={control}
                  name={name}
                  render={({ field: rhf }) => (
                    <Select value={(rhf.value as string) ?? ""} onValueChange={rhf.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options ?? []).map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            );

          case "multi_select":
            return (
              <Controller
                key={field.id}
                control={control}
                name={name}
                render={({ field: rhf }) => (
                  <TagInput
                    label={field.label}
                    value={Array.isArray(rhf.value) ? (rhf.value as string[]) : []}
                    onChange={rhf.onChange}
                    suggestions={field.options ?? []}
                  />
                )}
              />
            );

          case "number":
          case "rating":
            return <Input key={field.id} label={field.label} type="number" {...register(name, { valueAsNumber: true })} />;

          case "date":
            return <Input key={field.id} label={field.label} type="date" {...register(name)} />;

          case "url":
            return <Input key={field.id} label={field.label} type="url" placeholder="https://..." {...register(name)} />;

          case "text":
          default:
            return <Input key={field.id} label={field.label} {...register(name)} />;
        }
      })}
    </div>
  );
}

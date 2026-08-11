"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { Plus, Trash2, ListPlus } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Badge,
  Drawer,
  DrawerContent,
} from "@trading-os/design-system";
import { CustomFieldTypeSchema, type CreateCustomFieldDefinitionInput, type CustomFieldDefinitionRecord } from "@trading-os/shared-types";
import { DEMO_USER_ID } from "@/lib/demo-data";
import { useCustomFields, useCreateCustomField, useDeleteCustomField } from "../hooks/useSettings";

const ENTITY_TYPES: { value: CustomFieldDefinitionRecord["entityType"]; label: string }[] = [
  { value: "trade", label: "Trade" },
  { value: "account", label: "Account" },
  { value: "strategy", label: "Strategy" },
];

function getBlankFieldValues(): CreateCustomFieldDefinitionInput {
  return { userId: DEMO_USER_ID, entityType: "trade", label: "", type: "text", required: false, order: 0, options: [] };
}

export function CustomFieldsManager() {
  const { data: fields = [] } = useCustomFields();
  const createField = useCreateCustomField();
  const deleteField = useDeleteCustomField();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const { register, control, handleSubmit, watch, reset } = useForm<CreateCustomFieldDefinitionInput>({
    defaultValues: getBlankFieldValues(),
  });
  const watchedType = watch("type");

  async function onSubmit(values: CreateCustomFieldDefinitionInput) {
    await createField.mutateAsync({
      ...values,
      order: fields.length,
      options: values.type === "select" || values.type === "multi_select" ? values.options : undefined,
    });
    reset(getBlankFieldValues());
    setDrawerOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Fields</CardTitle>
        <Button size="sm" variant="ghost" onClick={() => setDrawerOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Field
        </Button>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-xs text-text-muted">
          Fields defined here appear automatically on the Trade Journal entry form under "Custom Fields" — no code change, no
          migration. This is the mechanism every trade record's <code className="font-tabular">customFields</code> map has been
          reserved for since Phase 0.
        </p>

        {fields.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-subtle p-8 text-center">
            <ListPlus className="h-6 w-6 text-text-muted" />
            <p className="text-sm text-text-muted">No custom fields yet. Add one to see it appear on the trade form immediately.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {fields.map((field) => (
              <div key={field.id} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2">
                <div className="flex items-center gap-2.5">
                  <Badge variant="brand">{field.entityType}</Badge>
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      {field.label}
                      {field.required && <span className="ml-1 text-loss">*</span>}
                    </div>
                    <div className="text-xs text-text-muted">
                      {field.type}
                      {field.options?.length ? ` · ${field.options.join(", ")}` : ""}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteField.mutate(field.id)}
                  aria-label={`Delete ${field.label}`}
                  className="rounded p-1.5 text-text-muted hover:bg-loss/15 hover:text-loss"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent title="New Custom Field" size="md">
          <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Applies To</label>
              <Controller
                control={control}
                name="entityType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <Input label="Field Label" placeholder="e.g. Broker Order ID" {...register("label")} />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Field Type</label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CustomFieldTypeSchema.options.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {(watchedType === "select" || watchedType === "multi_select") && (
              <Controller
                control={control}
                name="options"
                render={({ field }) => (
                  <Input
                    label="Options (comma-separated)"
                    placeholder="A, B, C"
                    value={(field.value ?? []).join(", ")}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                  />
                )}
              />
            )}

            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="required"
                render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
              />
              <span className="text-sm text-text-secondary">Required</span>
            </div>

            <div className="mt-auto flex justify-end gap-2 border-t border-border-subtle pt-4">
              <Button type="button" variant="ghost" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createField.isPending}>
                {createField.isPending ? "Saving..." : "Add Field"}
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}

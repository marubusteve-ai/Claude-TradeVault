"use client";

import * as React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTradeInputSchema, type CreateTradeInput } from "@trading-os/shared-types";
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@trading-os/design-system";
import { DEMO_STRATEGIES } from "@/lib/demo-data";
import { CoreDetailsSection } from "./sections/CoreDetailsSection";
import { ExecutionRiskSection } from "./sections/ExecutionRiskSection";
import { ExcursionReviewSection } from "./sections/ExcursionReviewSection";
import { LinksSection } from "./sections/LinksSection";
import { DynamicCustomFieldsSection } from "./sections/DynamicCustomFieldsSection";

export interface TradeFormProps {
  defaultValues: CreateTradeInput;
  onSubmit: (values: CreateTradeInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

/**
 * Every field on this form traces to a property on TradeSchema in
 * @trading-os/shared-types — the same schema the server action validates
 * against and Postgres/IndexedDB persist. There is exactly one definition
 * of what a trade looks like; this form doesn't maintain a parallel one.
 */
export function TradeForm({ defaultValues, onSubmit, onCancel, submitLabel = "Save Trade", isSubmitting }: TradeFormProps) {
  const methods = useForm<CreateTradeInput>({
    resolver: zodResolver(CreateTradeInputSchema),
    defaultValues,
    mode: "onBlur",
  });

  const [tab, setTab] = React.useState("details");

  async function handleValidSubmit(values: CreateTradeInput) {
    await onSubmit(values);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleValidSubmit)} className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto pb-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="execution">Execution & Risk</TabsTrigger>
              <TabsTrigger value="review">Excursion & Review</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
              <TabsTrigger value="custom">Custom Fields</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <CoreDetailsSection strategies={DEMO_STRATEGIES} />
            </TabsContent>
            <TabsContent value="execution">
              <ExecutionRiskSection />
            </TabsContent>
            <TabsContent value="review">
              <ExcursionReviewSection />
            </TabsContent>
            <TabsContent value="links">
              <LinksSection />
            </TabsContent>
            <TabsContent value="custom">
              <DynamicCustomFieldsSection />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border-subtle pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { CreateTradeInput } from "@trading-os/shared-types";
import { Input, Textarea, TagInput } from "@trading-os/design-system";
import { EMOTIONAL_TAGS, MISTAKE_CATEGORIES } from "../../../lib/formDefaults";

export function ExcursionReviewSection() {
  const { register, control } = useFormContext<CreateTradeInput>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Excursion</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="MFE Price" type="number" step="any" {...register("mfePrice", { valueAsNumber: true })} />
          <Input label="MFE Amount ($)" type="number" step="any" {...register("mfeAmount", { valueAsNumber: true })} />
          <Input label="MAE Price" type="number" step="any" {...register("maePrice", { valueAsNumber: true })} />
          <Input label="MAE Amount ($)" type="number" step="any" {...register("maeAmount", { valueAsNumber: true })} />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Psychology & Review</h4>
        <div className="flex flex-col gap-4">
          <Controller
            control={control}
            name="emotionalState"
            render={({ field }) => (
              <TagInput
                label="Emotional State"
                value={field.value}
                onChange={field.onChange}
                suggestions={[...EMOTIONAL_TAGS]}
                variant="brand"
                placeholder="Add a feeling and press Enter..."
              />
            )}
          />
          <Controller
            control={control}
            name="mistakes"
            render={({ field }) => (
              <TagInput
                label="Mistakes"
                value={field.value}
                onChange={field.onChange}
                suggestions={[...MISTAKE_CATEGORIES]}
                variant="loss"
                placeholder="Add a mistake and press Enter..."
              />
            )}
          />
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput label="Tags" value={field.value} onChange={field.onChange} placeholder="Free-form tags..." />
            )}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Textarea label="Comment" placeholder="What happened, what you noticed..." {...register("comment")} />
            <Textarea label="Lessons" placeholder="What you'd do differently next time..." {...register("lessons")} />
          </div>
          <Input label="Trade Rating (1-10)" type="number" min={1} max={10} {...register("rating", { valueAsNumber: true })} />
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../utils/cn";

export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  valueLabel?: string;
}

export const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, label, valueLabel, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {(label || valueLabel) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-text-secondary">{label}</span>}
          {valueLabel && <span className="font-tabular font-medium text-text-primary">{valueLabel}</span>}
        </div>
      )}
      <SliderPrimitive.Root ref={ref} className={cn("relative flex h-4 w-full touch-none select-none items-center", className)} {...props}>
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-surface-hover">
          <SliderPrimitive.Range className="absolute h-full bg-brand" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-brand bg-surface shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas" />
      </SliderPrimitive.Root>
    </div>
  )
);
Slider.displayName = "Slider";

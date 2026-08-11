"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;

export interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  title: string;
  description?: string;
  /** Grid width in rem-ish terms — 'md' fits a focused form, 'lg' fits the tabbed trade entry form. */
  size?: "md" | "lg" | "xl";
}

const SIZE_CLASSES: Record<NonNullable<DrawerContentProps["size"]>, string> = {
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export const DrawerContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DrawerContentProps>(
  ({ className, children, title, description, size = "lg", ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-surface p-6 shadow-lg",
          "transition-transform duration-300 ease-os data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      >
        <div className="mb-4 flex shrink-0 items-start justify-between">
          <div>
            <DialogPrimitive.Title className="text-lg font-semibold text-text-primary">{title}</DialogPrimitive.Title>
            {description && <DialogPrimitive.Description className="mt-1 text-sm text-text-muted">{description}</DialogPrimitive.Description>}
          </div>
          <DialogPrimitive.Close asChild>
            <button type="button" aria-label="Close" className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary">
              <X className="h-4 w-4" />
            </button>
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
);
DrawerContent.displayName = "DrawerContent";

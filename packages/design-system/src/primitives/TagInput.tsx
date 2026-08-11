"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../utils/cn";
import { Badge } from "./Badge";

export interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  variant?: "neutral" | "profit" | "loss" | "warning" | "brand";
  className?: string;
}

/**
 * Composite, not a Radix wrapper — there's no single primitive this maps
 * to. Built from Input-level styling + Badge, reused everywhere the
 * product needs a free-form multi-value field: trade tags, emotional-state
 * selection, mistake categories, strategy asset-class lists.
 */
export function TagInput({ label, value, onChange, suggestions = [], placeholder, variant = "neutral", className }: TagInputProps) {
  const [draft, setDraft] = React.useState("");
  const inputId = React.useId();

  const availableSuggestions = suggestions.filter((s) => !value.includes(s));

  function commit(raw: string) {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface-raised px-2.5 py-2 focus-within:ring-2 focus-within:ring-brand">
        {value.map((tag) => (
          <Badge key={tag} variant={variant} className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
              className="rounded-full p-0.5 hover:bg-black/10"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
        <input
          id={inputId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
          placeholder={value.length === 0 ? placeholder : undefined}
          className="min-w-[6rem] flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        />
      </div>
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableSuggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => commit(s)}
              className="rounded-full border border-border-subtle px-2 py-0.5 text-xs text-text-muted transition-colors hover:border-brand hover:text-brand"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

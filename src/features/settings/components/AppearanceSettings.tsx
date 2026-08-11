"use client";

import { Check, Moon, Sun } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button, cn } from "@trading-os/design-system";
import { useThemeStore, ACCENT_PRESETS } from "@/lib/theme-store";

export function AppearanceSettings() {
  const mode = useThemeStore((s) => s.mode);
  const accent = useThemeStore((s) => s.accent);
  const setMode = useThemeStore((s) => s.setMode);
  const setAccent = useThemeStore((s) => s.setAccent);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">Theme</div>
          <div className="flex gap-2">
            <Button variant={mode === "dark" ? "primary" : "secondary"} size="sm" onClick={() => setMode("dark")}>
              <Moon className="h-3.5 w-3.5" />
              Dark
            </Button>
            <Button variant={mode === "light" ? "primary" : "secondary"} size="sm" onClick={() => setMode("light")}>
              <Sun className="h-3.5 w-3.5" />
              Light
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">Accent Color</div>
          <p className="mb-3 text-xs text-text-muted">
            Changes the brand accent everywhere it's used — buttons, active nav, chart highlights — instantly, with no rebuild. This
            is the design system's two-layer CSS variable indirection (see ARCHITECTURE.md) actually paying off at runtime.
          </p>
          <div className="flex flex-wrap gap-3">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setAccent(preset.id)}
                aria-label={`Use ${preset.label} accent`}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full border-2 transition-transform hover:scale-105",
                  accent === preset.id ? "border-text-primary" : "border-transparent"
                )}
                style={{ backgroundColor: preset.brand }}
              >
                {accent === preset.id && <Check className="h-4 w-4" style={{ color: preset.foreground }} />}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

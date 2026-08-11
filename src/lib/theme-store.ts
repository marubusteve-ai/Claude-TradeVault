import { create } from "zustand";

export type ThemeMode = "dark" | "light";

const MODE_STORAGE_KEY = "tradeos-theme";
const ACCENT_STORAGE_KEY = "tradeos-accent";

/**
 * A curated palette, not a free-form color picker: every preset here is
 * hand-checked against its foreground text color for contrast. A raw
 * `<input type=color>` could easily produce a brand color with unreadable
 * button text; offering fewer, good choices is the more responsible UX
 * default for something as load-bearing as the interactive accent color.
 */
export const ACCENT_PRESETS = [
  { id: "brass", label: "Brass", brand: "#d99a3a", brandHover: "#e8b563", foreground: "#0a0e16" },
  { id: "azure", label: "Azure", brand: "#3b7ae0", brandHover: "#6b9cec", foreground: "#ffffff" },
  { id: "emerald", label: "Emerald", brand: "#14b881", brandHover: "#43cc9c", foreground: "#0a0e16" },
  { id: "rose", label: "Rose", brand: "#dd4a52", brandHover: "#e97a80", foreground: "#ffffff" },
  { id: "violet", label: "Violet", brand: "#7c5ce0", brandHover: "#9b7ce8", foreground: "#ffffff" },
] as const;

export type AccentId = (typeof ACCENT_PRESETS)[number]["id"];

interface ThemeState {
  mode: ThemeMode;
  accent: AccentId;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentId) => void;
}

function applyMode(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode);
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // Storage can be unavailable (private browsing, quota) — theme still
    // applies for the session, it just won't persist across reloads.
  }
}

function applyAccent(accentId: AccentId) {
  if (typeof document === "undefined") return;
  const preset = ACCENT_PRESETS.find((p) => p.id === accentId) ?? ACCENT_PRESETS[0];
  // Overrides the same --tos-brand* variables packages/design-system/src/styles/theme.css
  // defines per [data-theme] — inline styles on :root win the cascade over
  // the stylesheet rule without needing a rebuild, which is the entire
  // point of the two-layer CSS-variable indirection documented in
  // ARCHITECTURE.md §7 since Phase 0.
  const root = document.documentElement.style;
  root.setProperty("--tos-brand", preset.brand);
  root.setProperty("--tos-brand-hover", preset.brandHover);
  root.setProperty("--tos-brand-foreground", preset.foreground);
  try {
    localStorage.setItem(ACCENT_STORAGE_KEY, accentId);
  } catch {
    // Same best-effort persistence as theme mode above.
  }
}

function readInitialMode(): ThemeMode {
  if (typeof document === "undefined") return "dark";
  // The inline script in layout.tsx already set data-theme before paint —
  // read it back rather than re-deciding, so the store and the DOM never
  // disagree for a frame.
  const current = document.documentElement.getAttribute("data-theme");
  return current === "light" ? "light" : "dark";
}

function readInitialAccent(): AccentId {
  if (typeof window === "undefined") return "brass";
  try {
    const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
    return (ACCENT_PRESETS.find((p) => p.id === stored)?.id ?? "brass") as AccentId;
  } catch {
    return "brass";
  }
}

/** Global theme store. Any component can `useThemeStore((s) => s.mode)` or call `.toggle()` — no prop drilling a theme value through the whole widget tree. */
export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: readInitialMode(),
  accent: readInitialAccent(),
  toggle: () => {
    const next: ThemeMode = get().mode === "dark" ? "light" : "dark";
    applyMode(next);
    set({ mode: next });
  },
  setMode: (mode) => {
    applyMode(mode);
    set({ mode });
  },
  setAccent: (accent) => {
    applyAccent(accent);
    set({ accent });
  },
}));

/** Called once on the settings page mount to re-apply a persisted accent — the mode's inline init script in layout.tsx doesn't handle accent since it's a much smaller flash-of-wrong-color risk than dark/light. */
export function applyPersistedAccentOnLoad() {
  applyAccent(readInitialAccent());
}

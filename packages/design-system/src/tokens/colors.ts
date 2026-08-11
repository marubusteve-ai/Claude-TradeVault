/**
 * TradeOS color system.
 *
 * Design intent: an instrument panel, not a generic SaaS dashboard. The
 * base is a deep, slightly cool-desaturated navy (not pure black — pure
 * black plus one neon accent is the most common AI-default dark theme, and
 * we want something with more material presence, closer to an OLED
 * monitor's true black-but-not-quite). The signature accent is a brass/
 * amber tone — a deliberate nod to classic trading-terminal phosphor and
 * ticker tape, used sparingly for brand and "live" moments, rather than
 * the indigo/violet that's become the default SaaS brand color everywhere
 * from Linear to Stripe to a thousand dashboard templates.
 *
 * Profit/loss are the one place we stay conventional on purpose: green-up,
 * red-down is load-bearing muscle memory for anyone who trades, so this is
 * not a place to take a stylistic risk. Both are tuned to be clear at a
 * glance without being neon-saturated across a screen full of KPI cards.
 */
export const colorPrimitives = {
  navy: {
    950: "#0a0e16",
    900: "#0f1420",
    850: "#141a28",
    800: "#1b2333",
    700: "#283248",
    600: "#3d4a68",
    500: "#5e6d8f",
    400: "#8794b0",
    300: "#b0bad0",
    200: "#d5dae6",
    100: "#e9ecf3",
    50: "#f5f6fa",
  },
  brass: { 600: "#b8791f", 500: "#d99a3a", 400: "#e8b563", 300: "#f0cc93" },
  emerald: { 600: "#0e9f6e", 500: "#14b881", 400: "#43cc9c" },
  rose: { 600: "#c2373f", 500: "#dd4a52", 400: "#e97a80" },
  amber: { 600: "#c2540c", 500: "#e06b1a", 400: "#ec8c4c" },
  azure: { 600: "#1f5fc4", 500: "#3b7ae0", 400: "#6b9cec" },
} as const;

/** Semantic tokens — components and CSS both reference these names, never raw primitives, so a full re-theme touches only this file (and its CSS-variable mirror in styles/theme.css). */
export const semanticColors = {
  dark: {
    bgCanvas: colorPrimitives.navy[950],
    bgSurface: colorPrimitives.navy[900],
    bgSurfaceRaised: colorPrimitives.navy[850],
    bgSurfaceHover: colorPrimitives.navy[800],
    border: colorPrimitives.navy[700],
    borderSubtle: colorPrimitives.navy[800],
    textPrimary: colorPrimitives.navy[50],
    textSecondary: colorPrimitives.navy[300],
    textMuted: colorPrimitives.navy[400],
    brand: colorPrimitives.brass[500],
    brandHover: colorPrimitives.brass[400],
    profit: colorPrimitives.emerald[500],
    profitMuted: colorPrimitives.emerald[400],
    loss: colorPrimitives.rose[500],
    lossMuted: colorPrimitives.rose[400],
    warning: colorPrimitives.amber[500],
    info: colorPrimitives.azure[500],
  },
  light: {
    bgCanvas: colorPrimitives.navy[50],
    bgSurface: "#ffffff",
    bgSurfaceRaised: "#ffffff",
    bgSurfaceHover: colorPrimitives.navy[100],
    border: colorPrimitives.navy[200],
    borderSubtle: colorPrimitives.navy[100],
    textPrimary: colorPrimitives.navy[900],
    textSecondary: colorPrimitives.navy[700],
    textMuted: colorPrimitives.navy[500],
    brand: colorPrimitives.brass[600],
    brandHover: colorPrimitives.brass[500],
    profit: colorPrimitives.emerald[600],
    profitMuted: colorPrimitives.emerald[500],
    loss: colorPrimitives.rose[600],
    lossMuted: colorPrimitives.rose[500],
    warning: colorPrimitives.amber[600],
    info: colorPrimitives.azure[600],
  },
} as const;

export type ThemeMode = keyof typeof semanticColors;
export type SemanticColorToken = keyof typeof semanticColors.dark;

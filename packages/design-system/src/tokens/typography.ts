/**
 * IBM Plex Sans for interface text, IBM Plex Mono for anything numeric.
 * Both come from the same type family, drawn together — a more coherent,
 * deliberate system than pairing two unrelated foundries (the extremely
 * common Inter+JetBrains-Mono default seen across most SaaS dashboards).
 * Plex's slightly engineered, technical character suits an instrument
 * panel; Plex Mono's tabular figures keep every P&L column, price ladder
 * and percentage perfectly aligned — the kind of small detail that reads
 * as "institutional" rather than "template."
 */
export const fontFamilies = {
  sans: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", monospace',
};

export const typeScale = {
  xs: { size: "0.75rem", lineHeight: "1rem" },
  sm: { size: "0.875rem", lineHeight: "1.25rem" },
  base: { size: "1rem", lineHeight: "1.5rem" },
  lg: { size: "1.125rem", lineHeight: "1.75rem" },
  xl: { size: "1.25rem", lineHeight: "1.75rem" },
  "2xl": { size: "1.5rem", lineHeight: "2rem" },
  "3xl": { size: "1.875rem", lineHeight: "2.25rem" },
  "4xl": { size: "2.25rem", lineHeight: "2.5rem" },
};

export const fontWeights = { regular: 400, medium: 500, semibold: 600, bold: 700 };

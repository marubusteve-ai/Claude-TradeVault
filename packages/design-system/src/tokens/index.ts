export * from "./colors";
export * from "./typography";

export const spacing = {
  0: "0",
  px: "1px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
};

/** Modest, precise radii — an instrument panel reads as considered rather than soft, so we bias small/medium over the bubbly rounding common in consumer SaaS. */
export const radii = { none: "0", sm: "0.25rem", md: "0.5rem", lg: "0.75rem", xl: "1rem", full: "9999px" };

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
  md: "0 4px 8px -2px rgb(0 0 0 / 0.35)",
  lg: "0 12px 24px -6px rgb(0 0 0 / 0.4)",
  glow: "0 0 0 1px var(--color-brand), 0 0 16px -4px var(--color-brand)",
};

export const motion = {
  fast: "120ms",
  base: "200ms",
  slow: "320ms",
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
};

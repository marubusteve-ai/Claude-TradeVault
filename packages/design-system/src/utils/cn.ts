import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Standard class-merging utility: clsx for conditional composition, tailwind-merge to resolve conflicting utility classes (e.g. a caller-supplied `p-2` correctly overriding a default `p-4`). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string and merges Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 

export function formatDate(date: Date) {
  return date.toLocaleDateString("de-CH", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}


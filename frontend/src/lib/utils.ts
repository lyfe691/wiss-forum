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

/**
 * Generates a consistent avatar URL from username using Dicebear
 * @param username - The username to generate avatar for
 * @param fallback - Optional fallback avatar URL
 * @returns URL to the avatar image
 */
export function getAvatarUrl(username: string, fallback?: string): string {
  if (fallback) return fallback;
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(username)}`;
}


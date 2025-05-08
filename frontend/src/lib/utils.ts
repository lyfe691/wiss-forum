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

/**
 * Returns consistent badge colors for user roles
 * @param role - The user role (admin, teacher, student)
 * @returns Tailwind classes for badge styling
 */
export function getRoleBadgeColor(role: string): string {
  const normalizedRole = role?.toLowerCase() || '';
  
  switch (normalizedRole) {
    case 'admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'teacher':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    default: // student or any other role
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
}

/**
 * Returns consistently formatted role name with proper capitalization
 * @param role - The user role in any case format
 * @returns Properly capitalized role name (e.g., "Admin", "Teacher", "Student")
 */
export function formatRoleName(role: string): string {
  const normalizedRole = role?.toLowerCase() || '';
  
  switch (normalizedRole) {
    case 'admin':
      return 'Admin';
    case 'teacher':
      return 'Teacher';
    case 'student':
      return 'Student';
    default:
      return normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
  }
}


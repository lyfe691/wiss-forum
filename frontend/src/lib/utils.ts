import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Role, roleUtils } from "@/lib/types";

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
  // Only use fallback if it's a valid URL string and not empty
  if (fallback && fallback.trim().length > 0 && (fallback.startsWith('http') || fallback.startsWith('data:'))) {
    return fallback;
  }
  
  // Use Dicebear with consistent seed for deterministic avatars
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(username)}`;
}

/**
 * Returns consistent badge colors for user roles
 * @param role - The user role (can be string or Role enum)
 * @returns Tailwind classes for badge styling
 */
export function getRoleBadgeColor(role: Role | string): string {
  const normalizedRole = roleUtils.normalizeRole(typeof role === 'string' ? role : role);
  
  switch (normalizedRole) {
    case Role.ADMIN:
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case Role.TEACHER:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    default: // student or any other role
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
}

/**
 * Returns formatted role name with proper capitalization
 * @param role - The user role (can be string or Role enum)
 * @returns Properly capitalized role name (e.g., "Admin", "Teacher", "Student")
 */
export function formatRoleName(role: Role | string): string {
  const normalizedRole = roleUtils.normalizeRole(typeof role === 'string' ? role : role);
  
  switch (normalizedRole) {
    case Role.ADMIN:
      return 'Admin';
    case Role.TEACHER:
      return 'Teacher';
    case Role.STUDENT:
      return 'Student';
    default:
      // This should never happen with normalized roles, but just in case
      const asString = String(role).toLowerCase();
      return asString.charAt(0).toUpperCase() + asString.slice(1);
  }
}

/**
 * Returns initials from a name string
 * @param name - The name to get initials from
 * @param fallback - Optional fallback character if name is invalid
 * @returns One or two character string of initials
 */
export function getInitials(name?: string | null, fallback: string = 'U'): string {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return fallback;
  }
  
  return name
    .trim()
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
}


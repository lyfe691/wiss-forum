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
 * Generates a consistent avatar URL from userId using Dicebear
 * @param userId - The user ID to generate avatar for 
 * @param avatar - Optional avatar URL
 * @returns URL to the avatar image
 */
export function getAvatarUrl(userId: string, avatar?: string): string {
  if (avatar) {
    return avatar;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
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
 * @returns One or two character string of initials
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}


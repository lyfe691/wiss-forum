/**
 * Type definitions for consistent use across the application
 */

/**
 * User role enum with backend equivalents
 */
export enum Role {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

/**
 * Represents consistent user data structure throughout the app
 */
export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  role: Role;
  avatar?: string;
  bio?: string;
  createdAt?: string;
}

/**
 * Utility functions for role management
 */
export const roleUtils = {
  /**
   * Normalizes a role from any source to the standard enum format
   */
  normalizeRole(role: string | null | undefined): Role {
    if (!role) return Role.STUDENT;
    
    const normalizedRole = role.toLowerCase();
    
    if (normalizedRole === 'admin') return Role.ADMIN;
    if (normalizedRole === 'teacher') return Role.TEACHER;
    return Role.STUDENT;
  },
  
  /**
   * Checks if a role has at least the same privileges as another role
   */
  hasAtLeastSamePrivilegesAs(userRole: Role, requiredRole: Role): boolean {
    if (userRole === Role.ADMIN) return true;
    if (userRole === Role.TEACHER) return requiredRole !== Role.ADMIN;
    return requiredRole === Role.STUDENT;
  }
}; 
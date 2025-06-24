import { User, Role, roleUtils } from '@/lib/types';

/**
 * Utility functions for checking content permissions
 */

export interface ContentAuthor {
  _id: string;
  username: string;
  displayName?: string;
  role?: string;
}

export interface ContentItem {
  _id: string;
  author: ContentAuthor;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Check if user can edit content (only their own content)
 */
export function canEditContent(currentUser: User | null, content: ContentItem): boolean {
  if (!currentUser || !content?.author) return false;
  
  // Users can only edit their own content
  return currentUser._id === content.author._id;
}

/**
 * Check if user can delete content (own content + admin permissions)
 */
export function canDeleteContent(currentUser: User | null, content: ContentItem): boolean {
  if (!currentUser || !content?.author) return false;
  
  const userRole = roleUtils.normalizeRole(currentUser.role);
  
  // Users can delete their own content
  if (currentUser._id === content.author._id) return true;
  
  // Admins can delete any content
  if (userRole === Role.ADMIN) return true;
  
  // Teachers can delete any content (optional - adjust based on requirements)
  if (userRole === Role.TEACHER) return true;
  
  return false;
}

/**
 * Check if content was recently created (within edit window)
 */
export function isRecentlyCreated(content: ContentItem, minutesWindow: number = 15): boolean {
  if (!content.createdAt) return false;
  
  const createdAt = new Date(content.createdAt);
  const now = new Date();
  const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  
  return diffInMinutes <= minutesWindow;
}

/**
 * Check if content can be edited (own content + within time window)
 */
export function canEditContentWithTimeLimit(
  currentUser: User | null, 
  content: ContentItem, 
  minutesWindow: number = 15
): boolean {
  return canEditContent(currentUser, content) && isRecentlyCreated(content, minutesWindow);
}

/**
 * Get display message for why content cannot be edited
 */
export function getEditRestrictionMessage(
  currentUser: User | null,
  content: ContentItem,
  minutesWindow: number = 15
): string | null {
  if (!currentUser) return "You must be logged in to edit content";
  if (!canEditContent(currentUser, content)) return "You can only edit your own content";
  if (!isRecentlyCreated(content, minutesWindow)) {
    return `Content can only be edited within ${minutesWindow} minutes of creation`;
  }
  return null;
} 
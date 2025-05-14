package ch.wiss.forum.security;

import ch.wiss.forum.model.Role;
import ch.wiss.forum.model.User;

/**
 * Utility class for centralized permission checking logic.
 * This helps to keep permission checks consistent across the application.
 */
public class PermissionUtils {
    
    /**
     * Checks if a user can modify another user's data.
     * 
     * @param currentUser The user performing the action
     * @param targetUserId The ID of the user being modified
     * @return true if the current user can modify the target user
     */
    public static boolean canModifyUser(User currentUser, String targetUserId) {
        if (currentUser == null || targetUserId == null) {
            return false;
        }
        
        // Users can modify their own data
        if (targetUserId.equals(currentUser.getId())) {
            return true;
        }
        
        // Admins can modify other users except other admins
        if (Role.ADMIN.equals(currentUser.getRole())) {
            // Need to check if target is also admin in the service layer
            return true;
        }
        
        return false;
    }
    
    /**
     * Checks if a user can modify the role of another user.
     * 
     * @param currentUser The user performing the action
     * @param targetUser The user whose role is being modified
     * @return true if the current user can modify the target user's role
     */
    public static boolean canModifyUserRole(User currentUser, User targetUser) {
        if (currentUser == null || targetUser == null) {
            return false;
        }
        
        // Only admins can modify roles
        if (!Role.ADMIN.equals(currentUser.getRole())) {
            return false;
        }
        
        // Admins cannot modify other admins' roles
        if (Role.ADMIN.equals(targetUser.getRole()) && 
            !targetUser.getId().equals(currentUser.getId())) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Checks if a user can modify content.
     * 
     * @param currentUser The user performing the action
     * @param authorId The ID of the content author
     * @return true if the current user can modify the content
     */
    public static boolean canModifyContent(User currentUser, String authorId) {
        if (currentUser == null || authorId == null) {
            return false;
        }
        
        // Users can modify their own content
        if (authorId.equals(currentUser.getId())) {
            return true;
        }
        
        // Admins and teachers can modify any content
        return Role.ADMIN.equals(currentUser.getRole()) || 
               Role.TEACHER.equals(currentUser.getRole());
    }
    
    /**
     * Checks if a user can manage categories.
     * 
     * @param currentUser The user performing the action
     * @return true if the current user can manage categories
     */
    public static boolean canManageCategories(User currentUser) {
        if (currentUser == null) {
            return false;
        }
        
        return Role.ADMIN.equals(currentUser.getRole()) || 
               Role.TEACHER.equals(currentUser.getRole());
    }
    
    /**
     * Checks if a user can delete categories.
     * Only admins can delete categories.
     * 
     * @param currentUser The user performing the action
     * @return true if the current user can delete categories
     */
    public static boolean canDeleteCategories(User currentUser) {
        if (currentUser == null) {
            return false;
        }
        
        return Role.ADMIN.equals(currentUser.getRole());
    }
} 
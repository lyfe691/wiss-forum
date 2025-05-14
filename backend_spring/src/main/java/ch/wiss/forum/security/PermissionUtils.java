package ch.wiss.forum.security;

import ch.wiss.forum.model.Role;
import ch.wiss.forum.model.User;

/**
 * utility class for centralized permission checking logic.
 * this helps to keep permission checks consistent across the application.
 */
public class PermissionUtils {
    
    /**
     * checks if a user can modify another user's data.
     * 
     * @param currentUser the user performing the action
     * @param targetUserId the id of the user being modified
     * @return true if the current user can modify the target user
     */
    public static boolean canModifyUser(User currentUser, String targetUserId) {
        if (currentUser == null || targetUserId == null) {
            return false;
        }
        
        // users can modify their own data
        if (targetUserId.equals(currentUser.getId())) {
            return true;
        }
        
        // admins can modify other users except other admins
        if (Role.ADMIN.equals(currentUser.getRole())) {
            // need to check if target is also admin in the service layer
            return true;
        }
        
        return false;
    }
    
    /**
     * checks if a user can modify the role of another user.
     * 
     * @param currentUser the user performing the action
     * @param targetUser the user whose role is being modified
     * @return true if the current user can modify the target user's role
     */
    public static boolean canModifyUserRole(User currentUser, User targetUser) {
        if (currentUser == null || targetUser == null) {
            return false;
        }
        
        // only admins can modify roles
        if (!Role.ADMIN.equals(currentUser.getRole())) {
            return false;
        }
        
        // admins cannot modify other admins' roles
        if (Role.ADMIN.equals(targetUser.getRole()) && 
            !targetUser.getId().equals(currentUser.getId())) {
            return false;
        }
        
        return true;
    }
    
    /**
     * checks if a user can modify content.
     * 
     * @param currentUser the user performing the action
     * @param authorId the id of the content author
     * @return true if the current user can modify the content
     */
    public static boolean canModifyContent(User currentUser, String authorId) {
        if (currentUser == null || authorId == null) {
            return false;
        }
        
        // users can modify their own content
        if (authorId.equals(currentUser.getId())) {
            return true;
        }
        
        // admins and teachers can modify any content
        return Role.ADMIN.equals(currentUser.getRole()) || 
               Role.TEACHER.equals(currentUser.getRole());
    }
    
    /**
     * checks if a user can manage categories.
     * 
     * @param currentUser the user performing the action
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
     * checks if a user can delete categories.
     * only admins can delete categories.
     * 
     * @param currentUser the user performing the action
     * @return true if the current user can delete categories
     */
    public static boolean canDeleteCategories(User currentUser) {
        if (currentUser == null) {
            return false;
        }
        
        return Role.ADMIN.equals(currentUser.getRole());
    }
} 
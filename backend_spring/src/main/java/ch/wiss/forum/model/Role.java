package ch.wiss.forum.model;

/**
 * Enum representing user roles in the system with a clear hierarchy.
 * STUDENT < TEACHER < ADMIN in terms of permissions.
 */
public enum Role {
    STUDENT,
    TEACHER,
    ADMIN;
    
    /**
     * Safely converts a string to a Role enum value.
     * 
     * @param roleStr The string to convert
     * @return The corresponding Role or STUDENT if invalid
     */
    public static Role fromString(String roleStr) {
        if (roleStr == null) {
            return STUDENT;
        }
        
        try {
            return Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return STUDENT;
        }
    }
    
    /**
     * Checks if this role has equal or higher privileges than the specified role.
     * 
     * @param role The role to compare against
     * @return true if this role has equal or higher privileges
     */
    public boolean hasAtLeastSamePrivilegesAs(Role role) {
        if (this == ADMIN) return true;
        if (this == TEACHER) return role != ADMIN;
        return role == STUDENT;
    }
} 
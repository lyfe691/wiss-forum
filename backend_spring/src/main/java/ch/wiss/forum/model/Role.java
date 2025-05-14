package ch.wiss.forum.model;

/**
 * enum representing user roles in the system with a clear hierarchy.
 * STUDENT < TEACHER < ADMIN in terms of permissions, ADMIN being the highest privilege
 */
public enum Role {
    STUDENT,
    TEACHER,
    ADMIN;
    
    /**
     * safely converts a string to a Role enum value
     * 
     * @param roleStr the string to convert
     * @return the corresponding Role or STUDENT if invalid
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
     * checks if this role has equal or higher privileges than the specified role
     * 
     * @param role the role to compare against
     * @return true if this role has equal or higher privileges
     */
    public boolean hasAtLeastSamePrivilegesAs(Role role) {
        if (this == ADMIN) return true;
        if (this == TEACHER) return role != ADMIN;
        return role == STUDENT;
    }
} 
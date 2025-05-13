package ch.wiss.forum.validation;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

@Component
public class UserValidator {
    
    // Password pattern: at least 6 characters with no spaces
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^\\S{6,}$");
    
    // Username pattern: no spaces allowed, 3-20 characters
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^\\S{3,20}$");
    
    // Email pattern: must end with @wiss-edu.ch
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w.-]+@wiss-edu\\.ch$");
    
    // Maximum length for bio
    private static final int MAX_BIO_LENGTH = 500;
    
    // Display name min and max length
    private static final int MIN_DISPLAY_NAME_LENGTH = 3;
    private static final int MAX_DISPLAY_NAME_LENGTH = 50;
    
    // List of inappropriate words/terms for username validation
    private static final List<String> INAPPROPRIATE_TERMS = Arrays.asList(
            "admin", "root", "moderator", "fuck", "shit", "ass", "sex", 
            "nude", "xxx", "porn", "nsfw", "racist", "nazi"
    );
    
    /**
     * Validates if the password meets requirements:
     * - At least 6 characters
     * - No spaces
     */
    public boolean isValidPassword(String password) {
        return password != null && PASSWORD_PATTERN.matcher(password).matches();
    }
    
    /**
     * Validates if the username meets requirements:
     * - No spaces
     * - 3-20 characters
     * - Doesn't contain inappropriate terms
     */
    public boolean isValidUsername(String username) {
        if (username == null || !USERNAME_PATTERN.matcher(username).matches()) {
            return false;
        }
        
        String lowercaseUsername = username.toLowerCase();
        return INAPPROPRIATE_TERMS.stream()
                .noneMatch(term -> lowercaseUsername.contains(term));
    }
    
    /**
     * Validates if the email meets requirements:
     * - Must end with @wiss-edu.ch
     */
    public boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * Validates if the display name meets requirements:
     * - Must be between 3-50 characters
     */
    public boolean isValidDisplayName(String displayName) {
        return displayName != null && 
               displayName.length() >= MIN_DISPLAY_NAME_LENGTH && 
               displayName.length() <= MAX_DISPLAY_NAME_LENGTH;
    }
    
    /**
     * Validates if the bio meets requirements:
     * - Must not exceed 500 characters
     */
    public boolean isValidBio(String bio) {
        return bio == null || bio.length() <= MAX_BIO_LENGTH;
    }
} 
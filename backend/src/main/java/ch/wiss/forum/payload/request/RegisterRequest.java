package ch.wiss.forum.payload.request;

import ch.wiss.forum.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @NotBlank
    @Pattern(regexp = "^\\S{3,20}$", message = "Username must be 3-20 characters with no spaces")
    private String username;
    
    @NotBlank
    @Pattern(regexp = "^[\\w.-]+@wiss-edu\\.ch$|^[\\w.-]+@wiss\\.ch$", message = "Email must end with @wiss-edu.ch or @wiss.ch")
    private String email;
    
    @NotBlank
    @Pattern(regexp = "^\\S{6,}$", message = "Password must be at least 6 characters long and must not contain spaces")
    private String password;
    
    @NotBlank
    @Size(min = 3, max = 50, message = "Display name must be between 3 and 50 characters")
    private String displayName;
    
    private Role role;
    
    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;
    
    private String avatar;
} 
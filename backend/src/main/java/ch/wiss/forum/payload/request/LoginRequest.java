package ch.wiss.forum.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    
    private String username;
    
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    // helper to get either username or email for auth
    public String getUsernameOrEmail() {
        return username != null && !username.isEmpty() ? username : email;
    }
} 
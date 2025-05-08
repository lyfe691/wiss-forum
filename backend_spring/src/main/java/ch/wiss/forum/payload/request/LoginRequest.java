package ch.wiss.forum.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    
    @NotBlank
    private String username;
    
    @NotBlank
    private String password;
} 
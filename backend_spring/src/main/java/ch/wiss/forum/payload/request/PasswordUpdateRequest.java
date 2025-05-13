package ch.wiss.forum.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PasswordUpdateRequest {
    
    @NotBlank
    private String currentPassword;
    
    @NotBlank
    @Pattern(regexp = "^\\S{6,}$", message = "Password must be at least 6 characters long and must not contain spaces")
    private String newPassword;
} 
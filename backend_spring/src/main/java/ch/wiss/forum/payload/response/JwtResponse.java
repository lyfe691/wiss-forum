package ch.wiss.forum.payload.response;

import ch.wiss.forum.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class JwtResponse {
    
    private String token;
    private String type;
    private String id;
    private String username;
    private String email;
    private Role role;
    private String displayName;
    private String avatar;
    
    public JwtResponse(String token, String id, String username, String email, Role role, String displayName, String avatar) {
        this.token = token;
        this.type = "Bearer";
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.displayName = displayName;
        this.avatar = avatar;
    }
} 
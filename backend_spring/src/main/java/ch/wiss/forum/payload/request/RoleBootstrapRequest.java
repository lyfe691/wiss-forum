package ch.wiss.forum.payload.request;

import lombok.Data;

// request to bootstrap a role
// mainly used for development purposes
@Data
public class RoleBootstrapRequest {
    
    private String userId;
    private String key;
} 
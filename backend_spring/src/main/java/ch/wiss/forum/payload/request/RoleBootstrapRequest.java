package ch.wiss.forum.payload.request;

import lombok.Data;

@Data
public class RoleBootstrapRequest {
    
    private String userId;
    private String key;
} 
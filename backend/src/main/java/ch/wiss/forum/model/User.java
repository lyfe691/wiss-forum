package ch.wiss.forum.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.cglib.core.Local;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// user model

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User implements UserDetails {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    
    private Role role;
    
    private String displayName;
    
    private String avatar;
    
    private String bio;
    
    // Social/Professional Links
    private String githubUrl;
    private String websiteUrl;
    private String linkedinUrl;
    private String twitterUrl;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private LocalDateTime lastActive;

    // gamification fields
    @Builder.Default
    private int totalScore = 0;
    
    @Builder.Default
    private int level = 1;
    
    @Builder.Default
    private int topicsCreated = 0;
    
    @Builder.Default
    private int postsCreated = 0;
    
    @Builder.Default
    private int likesReceived = 0;
    

    
    @Builder.Default
    private int currentStreak = 0;
    
    @Builder.Default
    private int longestStreak = 0;
    
    private LocalDateTime lastActivityDate;
    
    @Builder.Default
    private List<String> badges = new ArrayList<>();
    
    @Builder.Default
    private List<String> achievements = new ArrayList<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
} 
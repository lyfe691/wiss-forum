package ch.wiss.forum.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.ArrayList;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import ch.wiss.forum.model.Role;
import ch.wiss.forum.model.User;
import ch.wiss.forum.repository.UserRepository;
import ch.wiss.forum.model.Post;
import ch.wiss.forum.repository.PostRepository;
import ch.wiss.forum.security.PermissionUtils;
import ch.wiss.forum.validation.UserValidator;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PostRepository postRepository;
    private final UserValidator userValidator;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<User> getPublicUsersList() {
        return userRepository.findAll().stream()
            .map(this::sanitizeUserForPublic)
            .collect(Collectors.toList());
    }
    
    // Helper method to remove sensitive data from User objects
    private User sanitizeUserForPublic(User user) {
        User sanitizedUser = new User();
        sanitizedUser.setId(user.getId());
        sanitizedUser.setUsername(user.getUsername());
        sanitizedUser.setDisplayName(user.getDisplayName());
        sanitizedUser.setRole(user.getRole());
        sanitizedUser.setAvatar(user.getAvatar());
        sanitizedUser.setBio(user.getBio());
        sanitizedUser.setCreatedAt(user.getCreatedAt());
        sanitizedUser.setLastActive(user.getLastActive());
        return sanitizedUser;
    }
    
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
    
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }
    
    public User getUserByIdOrUsername(String idOrUsername) {
        // Try to find by ID first
        try {
            return getUserById(idOrUsername);
        } catch (RuntimeException e) {
            // If not found by ID, try by username
            try {
                return getUserByUsername(idOrUsername);
            } catch (RuntimeException e2) {
                throw new RuntimeException("User not found with ID or username: " + idOrUsername);
            }
        }
    }
    
    public User updateUser(String id, User userDetails, User currentUser) {
        // Check permission using centralized utility
        if (!PermissionUtils.canModifyUser(currentUser, id)) {
            throw new RuntimeException("Not authorized to update this user");
        }
        
        User user = getUserById(id);
        
        // Only update fields that are allowed
        if (userDetails.getUsername() != null) {
            // Validate username format
            if (!userValidator.isValidUsername(userDetails.getUsername())) {
                throw new RuntimeException("Username must be 3-20 characters with no spaces or inappropriate terms");
            }
            
            // Check if username is already taken
            if (!userDetails.getUsername().equals(user.getUsername()) && 
                userRepository.existsByUsername(userDetails.getUsername())) {
                throw new RuntimeException("Username is already taken");
            }
            user.setUsername(userDetails.getUsername());
        }
        
        if (userDetails.getEmail() != null) {
            // Validate email format
            if (!userValidator.isValidEmail(userDetails.getEmail())) {
                throw new RuntimeException("Email must end with @wiss-edu.ch");
            }
            
            // Check if email is already taken
            if (!userDetails.getEmail().equals(user.getEmail()) && 
                userRepository.existsByEmail(userDetails.getEmail())) {
                throw new RuntimeException("Email is already taken");
            }
            user.setEmail(userDetails.getEmail());
        }
        
        if (userDetails.getDisplayName() != null) {
            // Validate display name
            if (!userValidator.isValidDisplayName(userDetails.getDisplayName())) {
                throw new RuntimeException("Display name must be between 3 and 50 characters");
            }
            user.setDisplayName(userDetails.getDisplayName());
        }
        
        if (userDetails.getBio() != null) {
            // Validate bio
            if (!userValidator.isValidBio(userDetails.getBio())) {
                throw new RuntimeException("Bio must not exceed 500 characters");
            }
            user.setBio(userDetails.getBio());
        }
        
        if (userDetails.getAvatar() != null) {
            user.setAvatar(userDetails.getAvatar());
        }
        
        // Only admin can update roles
        if (userDetails.getRole() != null && PermissionUtils.canModifyUserRole(currentUser, user)) {
            user.setRole(userDetails.getRole());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    public User updatePassword(String id, String currentPassword, String newPassword, User currentUser) {
        // Check permission using centralized utility
        if (!PermissionUtils.canModifyUser(currentUser, id)) {
            throw new RuntimeException("Not authorized to update this user's password");
        }
        
        // Validate password format
        if (!userValidator.isValidPassword(newPassword)) {
            throw new RuntimeException("Password must be at least 6 characters long and must not contain spaces");
        }
        
        User user = getUserById(id);
        
        // Verify current password if not admin
        if (!id.equals(currentUser.getId()) || passwordEncoder.matches(currentPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        } else {
            throw new RuntimeException("Current password is incorrect");
        }
    }
    
    public void deleteUser(String id, User currentUser) {
        // Check permissions using centralized utility
        if (!PermissionUtils.canModifyUser(currentUser, id)) {
            throw new RuntimeException("Not authorized to delete this user");
        }
        
        User userToDelete = getUserById(id);
        
        // Check if the current user can modify the role of the user to delete
        if (!PermissionUtils.canModifyUserRole(currentUser, userToDelete)) {
            throw new RuntimeException("Admins cannot delete other admin accounts");
        }
        
        userRepository.delete(userToDelete);
    }
    
    public void updateLastActive(User user) {
        user.setLastActive(LocalDateTime.now());
        userRepository.save(user);
    }
    
    public User save(User user) {
        return userRepository.save(user);
    }
    
    public User updateUserRole(String id, Role newRole, User currentUser) {
        User targetUser = getUserById(id);
        
        // Check permission using centralized utility
        if (!PermissionUtils.canModifyUserRole(currentUser, targetUser)) {
            throw new RuntimeException("Not authorized to update this user's role");
        }
        
        // Update the role
        targetUser.setRole(newRole);
        targetUser.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(targetUser);
    }
    
    public List<Map<String, Object>> getUserLeaderboard() {
        // Get all posts
        List<Post> allPosts = postRepository.findAll();
        
        // Create a map to count likes per user
        Map<String, Integer> userLikesMap = new HashMap<>();
        Map<String, User> userMap = new HashMap<>();
        
        // Count likes for each user
        for (Post post : allPosts) {
            User author = post.getAuthor();
            if (author != null) {
                String userId = author.getId();
                int likes = post.getLikes() != null ? post.getLikes().size() : 0;
                
                userLikesMap.put(userId, userLikesMap.getOrDefault(userId, 0) + likes);
                userMap.put(userId, author);
            }
        }
        
        // Convert to list for sorting
        List<Map<String, Object>> leaderboard = new ArrayList<>();
        
        for (Map.Entry<String, Integer> entry : userLikesMap.entrySet()) {
            String userId = entry.getKey();
            Integer totalLikes = entry.getValue();
            User user = userMap.get(userId);
            
            Map<String, Object> userStats = new HashMap<>();
            userStats.put("userId", userId);
            userStats.put("username", user.getUsername());
            userStats.put("displayName", user.getDisplayName());
            userStats.put("role", user.getRole());
            userStats.put("avatar", user.getAvatar());
            userStats.put("totalLikes", totalLikes);
            
            leaderboard.add(userStats);
        }
        
        // Sort by total likes (descending)
        leaderboard.sort((a, b) -> {
            Integer likesA = (Integer) a.get("totalLikes");
            Integer likesB = (Integer) b.get("totalLikes");
            return likesB.compareTo(likesA);
        });
        
        return leaderboard;
    }
} 
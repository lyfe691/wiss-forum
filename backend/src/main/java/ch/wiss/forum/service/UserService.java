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
    
    // helper method to remove sensitive data from User objects
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
        // try to find by ID first
        try {
            return getUserById(idOrUsername);
        } catch (RuntimeException e) {
            // if not found by ID, try by username
            try {
                return getUserByUsername(idOrUsername);
            } catch (RuntimeException e2) {
                throw new RuntimeException("User not found with ID or username: " + idOrUsername);
            }
        }
    }
    
    public User updateUser(String id, User userDetails, User currentUser) {
        // check permission using centralized utility
        if (!PermissionUtils.canModifyUser(currentUser, id)) {
            throw new RuntimeException("Not authorized to update this user");
        }
        
        User user = getUserById(id);
        
        // only update fields that are allowed
        if (userDetails.getUsername() != null) {
            // validate username format
            if (!userValidator.isValidUsername(userDetails.getUsername())) {
                throw new RuntimeException("Username must be 3-20 characters with no spaces or inappropriate terms");
            }
            
            // check if username is already taken
            if (!userDetails.getUsername().equals(user.getUsername()) && 
                userRepository.existsByUsername(userDetails.getUsername())) {
                throw new RuntimeException("Username is already taken");
            }
            user.setUsername(userDetails.getUsername());
        }
        
        if (userDetails.getEmail() != null) {
            // validate email format
            if (!userValidator.isValidEmail(userDetails.getEmail())) {
                throw new RuntimeException("Email must end with @wiss-edu.ch");
            }
            
            // check if email is already taken
            if (!userDetails.getEmail().equals(user.getEmail()) && 
                userRepository.existsByEmail(userDetails.getEmail())) {
                throw new RuntimeException("Email is already taken");
            }
            user.setEmail(userDetails.getEmail());
        }
        
        if (userDetails.getDisplayName() != null) {
            // validate display name
            if (!userValidator.isValidDisplayName(userDetails.getDisplayName())) {
                throw new RuntimeException("Display name must be between 3 and 50 characters");
            }
            user.setDisplayName(userDetails.getDisplayName());
        }
        
        if (userDetails.getBio() != null) {
            // validate bio
            if (!userValidator.isValidBio(userDetails.getBio())) {
                throw new RuntimeException("Bio must not exceed 500 characters");
            }
            user.setBio(userDetails.getBio());
        }
        
        if (userDetails.getAvatar() != null) {
            user.setAvatar(userDetails.getAvatar());
        }
        
        // validate and update social links
        if (userDetails.getGithubUrl() != null) {
            if (!userValidator.isValidGithubUrl(userDetails.getGithubUrl())) {
                throw new RuntimeException("Invalid GitHub URL");
            }
            user.setGithubUrl(userDetails.getGithubUrl().trim().isEmpty() ? null : userDetails.getGithubUrl());
        }
        
        if (userDetails.getWebsiteUrl() != null) {
            if (!userValidator.isValidUrl(userDetails.getWebsiteUrl())) {
                throw new RuntimeException("Invalid website URL");
            }
            user.setWebsiteUrl(userDetails.getWebsiteUrl().trim().isEmpty() ? null : userDetails.getWebsiteUrl());
        }
        
        if (userDetails.getLinkedinUrl() != null) {
            if (!userValidator.isValidLinkedinUrl(userDetails.getLinkedinUrl())) {
                throw new RuntimeException("Invalid LinkedIn URL");
            }
            user.setLinkedinUrl(userDetails.getLinkedinUrl().trim().isEmpty() ? null : userDetails.getLinkedinUrl());
        }
        
        if (userDetails.getTwitterUrl() != null) {
            if (!userValidator.isValidTwitterUrl(userDetails.getTwitterUrl())) {
                throw new RuntimeException("Invalid Twitter/X URL");
            }
            user.setTwitterUrl(userDetails.getTwitterUrl().trim().isEmpty() ? null : userDetails.getTwitterUrl());
        }
        
        // only admin can update roles
        if (userDetails.getRole() != null && PermissionUtils.canModifyUserRole(currentUser, user)) {
            user.setRole(userDetails.getRole());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    public User updatePassword(String id, String currentPassword, String newPassword, User currentUser) {
        // check permission using centralized utility
        if (!PermissionUtils.canModifyUser(currentUser, id)) {
            throw new RuntimeException("Not authorized to update this user's password");
        }
        
        // validate password format
        if (!userValidator.isValidPassword(newPassword)) {
            throw new RuntimeException("Password must be at least 6 characters long and must not contain spaces");
        }
        
        User user = getUserById(id);
        
        // verify current password if not admin
        if (!id.equals(currentUser.getId()) || passwordEncoder.matches(currentPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        } else {
            throw new RuntimeException("Current password is incorrect");
        }
    }
    
    public void deleteUser(String id, User currentUser) {
        // check permissions using centralized utility
        if (!PermissionUtils.canModifyUser(currentUser, id)) {
            throw new RuntimeException("Not authorized to delete this user");
        }
        
        User userToDelete = getUserById(id);
        
        // check if the current user can modify the role of the user to delete
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
        
        // check permission using centralized utility
        if (!PermissionUtils.canModifyUserRole(currentUser, targetUser)) {
            throw new RuntimeException("Not authorized to update this user's role");
        }
        
        // update the role
        targetUser.setRole(newRole);
        targetUser.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(targetUser);
    }
    
    public List<Map<String, Object>> getUserLeaderboard() {
        // get all posts
        List<Post> allPosts = postRepository.findAll();
        
        // create a map to count likes per user
        Map<String, Integer> userLikesMap = new HashMap<>();
        Map<String, User> userMap = new HashMap<>();
        
        // count likes for each user for the leaderboard
        for (Post post : allPosts) {
            User author = post.getAuthor();
            if (author != null) {
                String userId = author.getId();
                int likes = post.getLikes() != null ? post.getLikes().size() : 0;
                
                userLikesMap.put(userId, userLikesMap.getOrDefault(userId, 0) + likes);
                userMap.put(userId, author);
            }
        }
        
        // convert to list for sorting
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
        
        // sort by total likes (descending)
        leaderboard.sort((a, b) -> {
            Integer likesA = (Integer) a.get("totalLikes");
            Integer likesB = (Integer) b.get("totalLikes");
            return likesB.compareTo(likesA);
        });
        
        return leaderboard;
    }
    
    public User updateUserAvatar(String userId, String avatarDataUrl, User requestingUser) {
        // check if user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // security check: only allow user to update their own avatar
        if (!PermissionUtils.canModifyUser(requestingUser, userId)) {
            throw new RuntimeException("You can only update your own profile picture");
        }
        
        // update avatar
        user.setAvatar(avatarDataUrl);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
} 
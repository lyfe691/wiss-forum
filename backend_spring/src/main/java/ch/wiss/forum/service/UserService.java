package ch.wiss.forum.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import ch.wiss.forum.model.Role;
import ch.wiss.forum.model.User;
import ch.wiss.forum.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
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
        // Check if the user is updating their own profile or is an admin
        if (!id.equals(currentUser.getId()) && !Role.ADMIN.equals(currentUser.getRole())) {
            throw new RuntimeException("Not authorized to update this user");
        }
        
        User user = getUserById(id);
        
        // Only update fields that are allowed
        if (userDetails.getUsername() != null) {
            // Check if username is already taken
            if (!userDetails.getUsername().equals(user.getUsername()) && 
                userRepository.existsByUsername(userDetails.getUsername())) {
                throw new RuntimeException("Username is already taken");
            }
            user.setUsername(userDetails.getUsername());
        }
        
        if (userDetails.getEmail() != null) {
            // Check if email is already taken
            if (!userDetails.getEmail().equals(user.getEmail()) && 
                userRepository.existsByEmail(userDetails.getEmail())) {
                throw new RuntimeException("Email is already taken");
            }
            user.setEmail(userDetails.getEmail());
        }
        
        if (userDetails.getDisplayName() != null) {
            user.setDisplayName(userDetails.getDisplayName());
        }
        
        if (userDetails.getBio() != null) {
            user.setBio(userDetails.getBio());
        }
        
        if (userDetails.getAvatar() != null) {
            user.setAvatar(userDetails.getAvatar());
        }
        
        // Only admin can update roles
        if (Role.ADMIN.equals(currentUser.getRole()) && userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    public User updatePassword(String id, String currentPassword, String newPassword, User currentUser) {
        // Check if the user is updating their own password or is an admin
        if (!id.equals(currentUser.getId()) && !Role.ADMIN.equals(currentUser.getRole())) {
            throw new RuntimeException("Not authorized to update this user's password");
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
        // Only admin or the user themselves can delete their account
        if (!id.equals(currentUser.getId()) && !Role.ADMIN.equals(currentUser.getRole())) {
            throw new RuntimeException("Not authorized to delete this user");
        }
        
        User user = getUserById(id);
        userRepository.delete(user);
    }
    
    public void updateLastActive(User user) {
        user.setLastActive(LocalDateTime.now());
        userRepository.save(user);
    }
    
    public User save(User user) {
        return userRepository.save(user);
    }
    
    public User updateUserRole(String id, Role newRole, User currentUser) {
        // Only admin can update roles
        if (!Role.ADMIN.equals(currentUser.getRole())) {
            throw new RuntimeException("Only admin can update user roles");
        }
        
        User user = getUserById(id);
        user.setRole(newRole);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
} 
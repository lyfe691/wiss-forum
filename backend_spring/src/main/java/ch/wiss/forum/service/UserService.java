package ch.wiss.forum.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
    
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
    
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }
    
    public User updateUser(String id, User userDetails, User currentUser) {
        // Check if the user is updating their own profile or is an admin
        if (!id.equals(currentUser.getId()) && !"admin".equals(currentUser.getRole())) {
            throw new RuntimeException("Not authorized to update this user");
        }
        
        User user = getUserById(id);
        
        // Only update fields that are allowed
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
        if ("admin".equals(currentUser.getRole()) && userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    public User updatePassword(String id, String currentPassword, String newPassword, User currentUser) {
        // Check if the user is updating their own password or is an admin
        if (!id.equals(currentUser.getId()) && !"admin".equals(currentUser.getRole())) {
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
        if (!id.equals(currentUser.getId()) && !"admin".equals(currentUser.getRole())) {
            throw new RuntimeException("Not authorized to delete this user");
        }
        
        User user = getUserById(id);
        userRepository.delete(user);
    }
    
    public void updateLastActive(User user) {
        user.setLastActive(LocalDateTime.now());
        userRepository.save(user);
    }
} 
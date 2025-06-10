package ch.wiss.forum.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.wiss.forum.model.Post;
import ch.wiss.forum.model.Role;
import ch.wiss.forum.model.Topic;
import ch.wiss.forum.model.User;
import ch.wiss.forum.payload.request.PasswordUpdateRequest;
import ch.wiss.forum.payload.request.RoleBootstrapRequest;
import ch.wiss.forum.payload.response.MessageResponse;
import ch.wiss.forum.service.GamificationService;
import ch.wiss.forum.service.PostService;
import ch.wiss.forum.service.TopicService;
import ch.wiss.forum.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    private final TopicService topicService;
    private final PostService postService;
    private final GamificationService gamificationService;
    
    // secret key for bootstrap process (JUST IN DEVELOPMENT, IN PRODUCTION I'LL USE ENV VARIABLES)
    private static final String BOOTSTRAP_ADMIN_KEY = "WISS_ADMIN_SETUP_2024";
    private static final String BOOTSTRAP_TEACHER_KEY = "WISS_ADMIN_SETUP_2024";
    private static final String BOOTSTRAP_STUDENT_KEY = "WISS_ADMIN_SETUP_2024";
    
    // bootstrap admin
    @PostMapping("/bootstrap-admin")
    public ResponseEntity<?> bootstrapAdmin(@RequestBody RoleBootstrapRequest request) {
        try {
            // validate the bootstrap key
            if (!BOOTSTRAP_ADMIN_KEY.equals(request.getKey())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Invalid bootstrap key"));
            }
            
            // get the user
            User user = userService.getUserById(request.getUserId());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("User not found"));
            }
            
            // update role to admin
            user.setRole(Role.ADMIN);
            User updatedUser = userService.save(user);
            
            return ResponseEntity.ok(new MessageResponse("User role updated to ADMIN successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error updating user role: " + e.getMessage()));
        }
    }
    
    // bootstrap student
    @PostMapping("/bootstrap-student")
    public ResponseEntity<?> bootstrapStudent(@RequestBody RoleBootstrapRequest request) {
        try {
            // validate the bootstrap key
            if (!BOOTSTRAP_STUDENT_KEY.equals(request.getKey())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Invalid bootstrap key"));
            }
            
            // get the user
            User user = userService.getUserById(request.getUserId());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("User not found"));
            }
            
            // update role to student
            user.setRole(Role.STUDENT);
            User updatedUser = userService.save(user);
            
            return ResponseEntity.ok(new MessageResponse("User role updated to STUDENT successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error updating user role: " + e.getMessage()));
        }
    }
    
    @PostMapping("/bootstrap-teacher")
    public ResponseEntity<?> bootstrapTeacher(@RequestBody RoleBootstrapRequest request) {
        try {
            // validate the bootstrap key
            if (!BOOTSTRAP_TEACHER_KEY.equals(request.getKey())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Invalid bootstrap key"));
            }
            
            // get the user
            User user = userService.getUserById(request.getUserId());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("User not found"));
            }
            
            // update role to teacher
            user.setRole(Role.TEACHER);
            User updatedUser = userService.save(user);
            
            return ResponseEntity.ok(new MessageResponse("User role updated to TEACHER successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error updating user role: " + e.getMessage()));
        }
    }
    
    // get all users
    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_TEACHER')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    // get user by username
    @GetMapping("/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }
    
    // get recent users
    @GetMapping("/public")
    public ResponseEntity<List<User>> getRecentUsers() {
        List<User> users = userService.getPublicUsersList();
        return ResponseEntity.ok(users);
    }
    
    // get user topics
    @GetMapping("/{username}/topics")
    public ResponseEntity<List<Topic>> getUserTopics(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            User user = userService.getUserByUsername(username);
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Topic> topics = topicService.getTopicsByAuthor(user, pageable);
            
            return ResponseEntity.ok(topics.getContent());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // get user posts
    @GetMapping("/{username}/posts")
    public ResponseEntity<List<Post>> getUserPosts(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            User user = userService.getUserByUsername(username);
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Post> posts = postService.getPostsByUser(user, pageable);
            
            return ResponseEntity.ok(posts.getContent());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // get current user profile
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        // refresh user details
        User user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(user);
    }

    // update current user profile
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> updateCurrentUserProfile(@Valid @RequestBody User userDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        User updatedUser = userService.updateUser(currentUser.getId(), userDetails, currentUser);
        return ResponseEntity.ok(updatedUser);
    }

    // update current user password
    @PutMapping("/profile/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateCurrentUserPassword(@Valid @RequestBody PasswordUpdateRequest passwordRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User currentUser = (User) authentication.getPrincipal();
            
            try {
                User updatedUser = userService.updatePassword(
                        currentUser.getId(), 
                        passwordRequest.getCurrentPassword(), 
                        passwordRequest.getNewPassword(),
                        currentUser);
                
                return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
            } catch (RuntimeException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Password update failed: " + e.getMessage()));
            }
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("User not authenticated"));
    }

    // update user (admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable String id, @Valid @RequestBody User userDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        User updatedUser = userService.updateUser(id, userDetails, currentUser);
        return ResponseEntity.ok(updatedUser);
    }

    // update user role (admin only)
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable String id, @RequestBody String roleStr) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        try {
            // get the target user
            User targetUser = userService.getUserById(id);
            
            // check if the target user is already an admin (prevent changing other admins)
            if (Role.ADMIN.equals(targetUser.getRole()) && !targetUser.getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("You cannot change the role of another admin"));
            }
            
            Role role = Role.valueOf(roleStr.toUpperCase());
            User updatedUser = userService.updateUserRole(id, role, currentUser);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error updating user role: " + e.getMessage()));
        }
    }

    // delete user (admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        userService.deleteUser(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    // get user leaderboard
    @GetMapping("/leaderboard")
    public ResponseEntity<?> getUserLeaderboard(@RequestParam(defaultValue = "overall") String type) {
        try {
            List<Map<String, Object>> leaderboard;
            
            switch (type.toLowerCase()) {
                case "enhanced":
                    leaderboard = gamificationService.getEnhancedLeaderboard();
                    break;
                case "likes":
                    leaderboard = userService.getUserLeaderboard();
                    break;
                default:
                    leaderboard = gamificationService.getEnhancedLeaderboard();
                    break;
            }
            
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch leaderboard: " + e.getMessage());
        }
    }
    
    // get current user's gamification stats
    @GetMapping("/profile/gamification")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserGamificationStats() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            Map<String, Object> stats = gamificationService.getUserGamificationStats(currentUser);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch gamification stats: " + e.getMessage());
        }
    }
    
    // get public gamification stats for any user
    @GetMapping("/{username}/gamification")
    public ResponseEntity<?> getPublicUserGamificationStats(@PathVariable String username) {
        try {
            User user = userService.getUserByUsername(username);
            Map<String, Object> stats = gamificationService.getUserGamificationStats(user);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch user gamification stats: " + e.getMessage());
        }
    }
} 
package ch.wiss.forum.service;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import ch.wiss.forum.model.Role;
import ch.wiss.forum.model.User;
import ch.wiss.forum.payload.request.LoginRequest;
import ch.wiss.forum.payload.request.RegisterRequest;
import ch.wiss.forum.payload.response.JwtResponse;
import ch.wiss.forum.repository.UserRepository;
import ch.wiss.forum.security.JwtUtils;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        String usernameOrEmail = loginRequest.getUsernameOrEmail();
        
        // Find user by email if the input looks like an email
        if (usernameOrEmail == null || usernameOrEmail.isEmpty()) {
            throw new RuntimeException("Username or email is required");
        }
        
        // For logging - helps with debugging
        if (usernameOrEmail.contains("@")) {
            System.out.println("Attempting to authenticate with email: " + usernameOrEmail);
        } else {
            System.out.println("Attempting to authenticate with username: " + usernameOrEmail);
        }
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(usernameOrEmail, loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        User userDetails = (User) authentication.getPrincipal();
        
        // Update last active time
        userDetails.setLastActive(LocalDateTime.now());
        userRepository.save(userDetails);
        
        return createJwtResponse(jwt, userDetails);
    }
    
    public JwtResponse refreshToken(User user) {
        // Generate a new JWT token for the user
        String jwt = jwtUtils.generateJwtToken(user.getUsername());
        
        // Update last active time
        user.setLastActive(LocalDateTime.now());
        userRepository.save(user);
        
        return createJwtResponse(jwt, user);
    }
    
    public JwtResponse registerUser(RegisterRequest registerRequest) {
        // Check if username is already taken
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        
        // Check if email is already in use
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        
        // Set default role if not provided
        Role role = registerRequest.getRole();
        if (role == null) {
            role = Role.STUDENT;
        }
        
        // Create new user
        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(role)
                .displayName(registerRequest.getDisplayName())
                .bio(registerRequest.getBio())
                .avatar(registerRequest.getAvatar())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .lastActive(LocalDateTime.now())
                .build();
        
        User savedUser = userRepository.save(user);
        
        // Generate JWT token for the new user
        String jwt = jwtUtils.generateJwtToken(savedUser.getUsername());
        
        return createJwtResponse(jwt, savedUser);
    }
    
    private JwtResponse createJwtResponse(String token, User user) {
        // Ensure displayName is never null - use username as fallback
        String displayName = user.getDisplayName();
        if (displayName == null || displayName.isEmpty()) {
            displayName = user.getUsername();
        }
        
        return new JwtResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                displayName,
                user.getAvatar()
        );
    }
} 
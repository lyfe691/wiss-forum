package ch.wiss.forum.service;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import ch.wiss.forum.model.User;
import ch.wiss.forum.payload.request.LoginRequest;
import ch.wiss.forum.payload.request.RegisterRequest;
import ch.wiss.forum.payload.response.JwtResponse;
import ch.wiss.forum.payload.response.MessageResponse;
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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        User userDetails = (User) authentication.getPrincipal();
        
        // Update last active time
        userDetails.setLastActive(LocalDateTime.now());
        userRepository.save(userDetails);
        
        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getRole(),
                userDetails.getDisplayName(),
                userDetails.getAvatar()
        );
    }
    
    public MessageResponse registerUser(RegisterRequest registerRequest) {
        // Check if username is already taken
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return new MessageResponse("Error: Username is already taken!");
        }
        
        // Check if email is already in use
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }
        
        // Set default role if not provided
        String role = registerRequest.getRole();
        if (role == null || role.isEmpty()) {
            role = "student";
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
        
        userRepository.save(user);
        
        return new MessageResponse("User registered successfully!");
    }
} 
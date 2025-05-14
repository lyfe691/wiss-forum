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
import ch.wiss.forum.validation.UserValidator;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserValidator userValidator;
    
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        String usernameOrEmail = loginRequest.getUsernameOrEmail();
        
        // find user by email if the input looks like an email
        if (usernameOrEmail == null || usernameOrEmail.isEmpty()) {
            throw new RuntimeException("Username or email is required");
        }
        
        // for logging - helps with debugging
        if (usernameOrEmail.contains("@")) {
            System.out.println("Attempting to authenticate with email: " + usernameOrEmail);
        } else {
            System.out.println("Attempting to authenticate with username: " + usernameOrEmail);
        }
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(usernameOrEmail, loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        User userDetails = (User) authentication.getPrincipal();
        
        // generate token with user object to include userId
        String jwt = jwtUtils.generateJwtToken(userDetails);
        
        // update last active time
        userDetails.setLastActive(LocalDateTime.now());
        userRepository.save(userDetails);
        
        return createJwtResponse(jwt, userDetails);
    }
    
    public JwtResponse refreshToken(User user) {
        // generate a new JWT token for the user with user object
        String jwt = jwtUtils.generateJwtToken(user);
        
        // update last active time
        user.setLastActive(LocalDateTime.now());
        userRepository.save(user);
        
        return createJwtResponse(jwt, user);
    }
    
    public JwtResponse registerUser(RegisterRequest registerRequest) {
        // validate username format
        if (!userValidator.isValidUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username must be 3-20 characters with no spaces or inappropriate terms.");
        }
        
        // validate email format
        if (!userValidator.isValidEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email must end with @wiss-edu.ch.");
        }
        
        // validate password format
        if (!userValidator.isValidPassword(registerRequest.getPassword())) {
            throw new RuntimeException("Password must be at least 6 characters long and must not contain spaces.");
        }
        
        // validate display name
        if (!userValidator.isValidDisplayName(registerRequest.getDisplayName())) {
            throw new RuntimeException("Display name must be between 3 and 50 characters.");
        }
        
        // validate bio if provided
        if (registerRequest.getBio() != null && !userValidator.isValidBio(registerRequest.getBio())) {
            throw new RuntimeException("Bio must not exceed 500 characters.");
        }
        
        // check if username is already taken
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username is already taken.");
        }
        
        // check if email is already in use
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already in use.");
        }
        
        // set default role if not provided
        Role role = registerRequest.getRole();
        if (role == null) {
            role = Role.STUDENT;
        }
        
        // create new user
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
        
        // generate JWT token for the new user
        String jwt = jwtUtils.generateJwtToken(savedUser.getUsername());
        
        return createJwtResponse(jwt, savedUser);
    }
    
    private JwtResponse createJwtResponse(String token, User user) {
        return new JwtResponse(
                token,
                "Bearer",
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getDisplayName(),
                user.getAvatar()
        );
    }
} 
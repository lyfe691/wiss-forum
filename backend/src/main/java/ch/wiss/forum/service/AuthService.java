package ch.wiss.forum.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import ch.wiss.forum.model.PasswordResetToken;
import ch.wiss.forum.model.Role;
import ch.wiss.forum.model.User;
import ch.wiss.forum.payload.request.LoginRequest;
import ch.wiss.forum.payload.request.RegisterRequest;
import ch.wiss.forum.payload.response.JwtResponse;
import ch.wiss.forum.repository.PasswordResetTokenRepository;
import ch.wiss.forum.repository.UserRepository;
import ch.wiss.forum.security.JwtUtils;
import ch.wiss.forum.validation.UserValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserValidator userValidator;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Value("${app.password-reset.expiration-minutes:30}")
    private int passwordResetExpirationMinutes;
    
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        String usernameOrEmail = loginRequest.getUsernameOrEmail();
        
        // find user by email if the input looks like an email
        if (usernameOrEmail == null || usernameOrEmail.isEmpty()) {
            throw new RuntimeException("Username or email is required");
        }
        
        // for logging - helps with debugging
        if (usernameOrEmail.contains("@")) {
            log.debug("Attempting to authenticate with email: {}", usernameOrEmail);
        } else {
            log.debug("Attempting to authenticate with username: {}", usernameOrEmail);
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
        
        // Set avatar based on user ID if no custom avatar provided
        if (savedUser.getAvatar() == null || savedUser.getAvatar().isEmpty()) {
            String avatarUrl = "https://api.dicebear.com/9.x/thumbs/svg?seed=" + savedUser.getId();
            savedUser.setAvatar(avatarUrl);
            savedUser = userRepository.save(savedUser);
        }
        
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

    // initiate password reset
    public void initiatePasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        // check if email exists and throw exception if not
        if (userOpt.isEmpty()) {
            log.info("Password reset requested for non-existent email: {}", email);
            throw new RuntimeException("No account found with this email address");
        }

        User user = userOpt.get();
        
        // generate unique token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(passwordResetExpirationMinutes);
        
        // delete any existing tokens for this user
        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);
        
        // create and save the password reset token
        PasswordResetToken passwordResetToken = PasswordResetToken.builder()
            .token(token)
            .user(user)
            .expiryDate(expiryDate)
            .build();
        
        passwordResetTokenRepository.save(passwordResetToken);
        
        // send password reset email
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), token);
            log.info("Password reset initiated for user: {}", user.getUsername());
        } catch (Exception e) {
            log.error("Failed to send password reset email: {}", e.getMessage());
            throw new RuntimeException("Failed to send password reset email");
        }
    }


    // reset password
    public void resetPassword(String token, String newPassword) {
        if (!userValidator.isValidPassword(newPassword)) {
            throw new RuntimeException("Password must be at least 6 characters long and must not contain spaces");
        }
        
        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid or expired password reset token"));
            
        if (passwordResetToken.isExpired()) {
            passwordResetTokenRepository.delete(passwordResetToken);
            throw new RuntimeException("Password reset token has expired");
        }
        
        User user = passwordResetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        // delete the used token
        passwordResetTokenRepository.delete(passwordResetToken);
        
        log.info("Password reset successful for user: {}", user.getUsername());
    }
} 
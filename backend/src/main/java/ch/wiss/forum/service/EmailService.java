package ch.wiss.forum.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.frontend-url}")
    private String frontendUrl;
    
    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Password Reset Request");
            
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            
            message.setText("Hello,\n\n" +
                    "You have requested to reset your password for the WISS Forum. " +
                    "Please click on the link below to reset your password:\n\n" +
                    resetLink + "\n\n" +
                    "If you did not request this, please ignore this email and your password will remain unchanged.\n\n" +
                    "This link will expire in 30 minutes.\n\n" +
                    "Best regards,\n" +
                    "Yanis Sebastian Zürcher");
            
            mailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Error sending password reset email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send password reset email");
        }
    }
} 
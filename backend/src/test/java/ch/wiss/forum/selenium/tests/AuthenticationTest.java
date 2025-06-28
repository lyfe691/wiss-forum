package ch.wiss.forum.selenium.tests;

import ch.wiss.forum.selenium.BaseSeleniumTest;
import ch.wiss.forum.selenium.pages.LoginPage;
import ch.wiss.forum.selenium.pages.RegisterPage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pure validation tests for authentication - no persistent sessions
 * 
 * @author Yanis Sebastian Zürcher
 */
@TestMethodOrder(OrderAnnotation.class)
@DisplayName("🔗 Authentication Validation Tests")
public class AuthenticationTest extends BaseSeleniumTest {
    
    private LoginPage loginPage;
    private RegisterPage registerPage;
    
    private static final String TEST_PASSWORD = "valid_password123";
    
    @BeforeEach
    void setUpPages() {
        loginPage = new LoginPage(driver, wait);
        registerPage = new RegisterPage(driver, wait);
        
        // start with clean browser state
        clearBrowserData();
    }
    
    @Test
    @Order(1)
    @DisplayName("🚫 Registration should reject admin-like usernames")
    void testFilteredUsernameValidation() {
        System.out.println("=== Testing Username Filtering ===");
        
        String inappropriateUsername = "lainadmin";
        String email = "user." + System.currentTimeMillis() + "@wiss-edu.ch";
        String displayName = "Lain Iwakura";
        
        registerPage.navigateToRegisterPage();
        registerPage.register(inappropriateUsername, email, TEST_PASSWORD, displayName);
        
        assertFalse(registerPage.isRegistrationSuccessful(), 
            "Admin-like usernames should be rejected");
        
        assertTrue(registerPage.hasUsernameError() || !registerPage.getErrorMessage().isEmpty(),
            "Should display username validation error");
        
        System.out.println("✓ Username filtering works correctly");
    }
    
    @Test
    @Order(2)
    @DisplayName("🚫 Registration should reject invalid email domains")
    void testEmailDomainValidation() {
        System.out.println("=== Testing Email Domain Validation ===");
        
        long timestamp = System.currentTimeMillis();
        String username = "rei" + timestamp;
        String invalidEmail = "rei.ayanami." + timestamp + "@nerv.jp";
        String displayName = "Rei Ayanami";
        
        registerPage.navigateToRegisterPage();
        registerPage.register(username, invalidEmail, TEST_PASSWORD, displayName);
        
        assertFalse(registerPage.isRegistrationSuccessful(), 
            "Invalid email domains should be rejected");
        
        assertTrue(registerPage.hasEmailError() || !registerPage.getErrorMessage().isEmpty(),
            "Should display email domain validation error");
        
        System.out.println("✓ Email domain validation works correctly");
    }
    
    @Test
    @Order(3)
    @DisplayName("🚫 Login should reject non-existent users")
    void testNonExistentUserValidation() {
        System.out.println("=== Testing Non-Existent User Validation ===");
        
        String invalidUsername = "maybeexistentinanothertimeline" + System.currentTimeMillis();
        String invalidPassword = "wrong_reality";
        
        loginPage.navigateToLoginPage();
        loginPage.login(invalidUsername, invalidPassword);
        
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        
        assertFalse(loginPage.isLoginSuccessful(), 
            "Non-existent users should be rejected");
        
        assertTrue(loginPage.getCurrentUrl().contains("/login"), 
            "Should remain at login page");
        
        String alertMessage = loginPage.getAlertMessage();
        assertTrue(!alertMessage.isEmpty() && 
                  (alertMessage.toLowerCase().contains("invalid") || 
                   alertMessage.toLowerCase().contains("failed")),
            "Should display authentication error");
        
        System.out.println("✓ Non-existent user validation works correctly");
    }
    
    @Test
    @Order(4)
    @DisplayName("✅ Valid registration should succeed")
    void testValidRegistration() {
        System.out.println("=== Testing Valid Registration ===");
        
        long timestamp = System.currentTimeMillis();
        String username = "lain" + timestamp;
        String email = "lain.iwakura." + timestamp + "@wiss-edu.ch";
        String displayName = "Lain Iwakura";
        
        System.out.println("Registering: " + displayName);
        registerPage.navigateToRegisterPage();
        registerPage.register(username, email, TEST_PASSWORD, displayName);
        
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        
        assertTrue(registerPage.isRegistrationSuccessful(), 
            "Valid registration should succeed");
        
        System.out.println("✓ Valid registration works correctly");
    }
    
    @Test
    @Order(5)
    @DisplayName("✅ Valid login should succeed")
    void testValidLogin() {
        System.out.println("=== Testing Valid Login ===");
        
        // First register a user
        long timestamp = System.currentTimeMillis();
        String username = "lain" + timestamp;
        String email = "lain.iwakura." + timestamp + "@wiss-edu.ch";
        String displayName = "Lain Iwakura";
        
        registerPage.navigateToRegisterPage();
        registerPage.register(username, email, TEST_PASSWORD, displayName);
        
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        assertTrue(registerPage.isRegistrationSuccessful(), "Registration should succeed");
        
        // Now test login
        System.out.println("Testing login for: " + displayName);
        loginPage.navigateToLoginPage();
        loginPage.login(username, TEST_PASSWORD);
        
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        
        assertTrue(loginPage.isLoginSuccessful(), 
            "Valid login should succeed");
        
        System.out.println("✓ Valid login works correctly");
        System.out.println("✓ All authentication validation tests passed");
    }
} 
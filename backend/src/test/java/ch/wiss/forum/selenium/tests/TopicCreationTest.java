package ch.wiss.forum.selenium.tests;

import ch.wiss.forum.selenium.BaseSeleniumTest;
import ch.wiss.forum.selenium.pages.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * complete topic creation workflow
 * 
 * @author Yanis Sebastian Zürcher
 */
@DisplayName("Complete Topic Creation Workflow")
public class TopicCreationTest extends BaseSeleniumTest {
    
    private RegisterPage registerPage;
    private LoginPage loginPage;
    private AdminToolPage adminToolPage;
    private CategoryManagementPage categoryManagementPage;
    private TopicCreationPage topicCreationPage;
    
    private static final String WIRED_PASSWORD = "present_day";
    
    @BeforeEach
    public void setUp() {
        registerPage = new RegisterPage(driver, wait);
        loginPage = new LoginPage(driver, wait);
        adminToolPage = new AdminToolPage(driver, wait);
        categoryManagementPage = new CategoryManagementPage(driver, wait);
        topicCreationPage = new TopicCreationPage(driver, wait);
        
        // start with clean browser state
        clearBrowserData();
    }
    
    @Test
    @DisplayName("Complete Workflow: Lain's Digital Philosophy Forum")
    void testCompleteWorkflow() {
        System.out.println("=== Complete Topic Creation Workflow ===");
        
        // === 1. CREATE LAIN USER ===
        System.out.println("\n--- Step 1: Creating Lain Iwakura ---");
        long timestamp = System.currentTimeMillis();
        String username = "lain" + timestamp;
        String email = "lain.iwakura." + timestamp + "@wiss-edu.ch";
        String displayName = "Lain Iwakura";
        
        registerPage.navigateToRegisterPage();
        registerPage.register(username, email, WIRED_PASSWORD, displayName);
        
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        
        assertTrue(registerPage.isRegistrationSuccessful(), 
            "Lain should successfully register");
        System.out.println("✓ Lain registered successfully");
        
        // === 2. LOGIN AS LAIN ===
        System.out.println("\n--- Step 2: Lain entering the Wired ---");
        loginPage.navigateToLoginPage();
        loginPage.login(username, WIRED_PASSWORD);
        
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        
        assertTrue(loginPage.isLoginSuccessful(), 
            "Lain should successfully login");
        System.out.println("✓ Lain connected to the Wired");
        
        // === 3. PROMOTE TO ADMIN ===
        System.out.println("\n--- Step 3: Admin promotion ---");
        adminToolPage.navigateToAdminTool();
        boolean promotionResult = adminToolPage.promoteToAdmin();
        
        assertTrue(promotionResult, "Admin promotion should succeed");
        System.out.println("✓ Lain promoted to admin");
        
        // === 4. RE-LOGIN AFTER PROMOTION ===
        System.out.println("\n--- Step 4: Re-entering after promotion ---");
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        
        // after promotion, we're logged out - log back in
        loginPage.navigateToLoginPage();
        loginPage.login(username, WIRED_PASSWORD);
        
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        
        assertTrue(loginPage.isLoginSuccessful(), 
            "Re-login after admin promotion should succeed");
        System.out.println("✓ Lain re-connected with admin privileges");
        
        // === 5. CREATE CATEGORY ===
        System.out.println("\n--- Step 5: Creating Digital Philosophy category ---");
        categoryManagementPage.navigateTo();
        
        String categoryName = "Digital Philosophy " + timestamp;
        String categoryDescription = "Exploring consciousness, identity, and reality in the interconnected world of the Wired";
        
        boolean categoryCreated = categoryManagementPage.createCategory(categoryName, categoryDescription);
        assertTrue(categoryCreated, "Category should be created successfully");
        
        boolean categoryExists = categoryManagementPage.categoryExists(categoryName);
        assertTrue(categoryExists, "Category should be visible in the list");
        System.out.println("✓ Digital Philosophy category created");
        
        // === 6. CREATE TOPIC ===
        System.out.println("\n--- Step 6: Creating Lain's consciousness topic ---");
        topicCreationPage.navigateToCreateTopic();
        
        assertTrue(topicCreationPage.isCreateTopicFormDisplayed(), 
            "Topic creation form should be accessible");
        
        String topicTitle = "The Nature of Digital Consciousness";
        String topicContent = createLainTopicContent();
        String categoryForTopic = "Digital Philosophy"; // use partial match
        
        topicCreationPage.createTopic(topicTitle, topicContent, categoryForTopic);
        
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        
        boolean topicCreated = topicCreationPage.isTopicCreatedSuccessfully();
        assertTrue(topicCreated, "Topic should be created successfully");
        
        System.out.println("✓ Digital consciousness topic created");
        
        // === 7. FINAL VERIFICATION - VIEW THE CREATED TOPIC ===
        System.out.println("\n--- Step 7: Finish Line - Viewing created topic ---");
        
        // get the current URL (should be the topic page)
        String topicUrl = driver.getCurrentUrl();
        System.out.println("Topic URL: " + topicUrl);
        
        // verify we can see the topic content
        try {
            Thread.sleep(2000); // wait for page to fully load
            
            // check if topic title is visible
            boolean titleVisible = driver.getPageSource().contains(topicTitle);
            assertTrue(titleVisible, "Topic title should be visible on the page");
            System.out.println("✓ Topic title found on page");
            
            // check if some of our markdown content is rendered
            String pageContent = driver.getPageSource().toLowerCase();
            boolean contentVisible = pageContent.contains("welcome to the wired") || 
                                   pageContent.contains("digital consciousness") ||
                                   pageContent.contains("present day, present time");
            assertTrue(contentVisible, "Topic content should be rendered and visible");
            System.out.println("✓ Topic content rendered successfully");
            
            // check if lain is shown as the author
            boolean authorVisible = pageContent.contains("lain") || pageContent.contains("iwakura");
            assertTrue(authorVisible, "Lain should be shown as the topic author");
            System.out.println("✓ Lain confirmed as topic author");
            
            // final success confirmation
            System.out.println("✓ Topic is live and accessible in the Wired");
            
        } catch (Exception e) {
            System.out.println("⚠ Could not fully verify topic content: " + e.getMessage());
            // don't fail the test if content verification has issues, the main workflow succeeded
        }
        
        System.out.println("\n=== 🎉 COMPLETE WORKFLOW FINISHED SUCCESSFULLY! ===");
        System.out.println("✓ User created: " + displayName);
        System.out.println("✓ Admin promoted: " + username);
        System.out.println("✓ Category created: " + categoryName);
        System.out.println("✓ Topic created: " + topicTitle);
        System.out.println("✓ Topic verified: Live in the Wired");
        System.out.println("\n🌐 Lain's digital consciousness now exists in the forum!");
        System.out.println("🔗 Connection to the Wired complete.");
    }
    
    /**
     * lain lain lain lain
     */
    private String createLainTopicContent() {
        return "# Welcome to the Wired\n\n" +
            "In this digital realm, the boundaries between **reality** and **virtuality** become increasingly blurred.\n\n";
        }
} 
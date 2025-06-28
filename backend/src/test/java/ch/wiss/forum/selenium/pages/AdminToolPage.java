package ch.wiss.forum.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.JavascriptExecutor;

/**
 * Page Object Model for AdminTool page, for role stuff so i can create a category etc.
 * 
 * @author Yanis Sebastian Zürcher
 */
public class AdminToolPage {
    
    private final WebDriver driver;
    private final WebDriverWait wait;
    
    // updated selectors to match AdminTool.tsx implementation  
    private static final String USER_ID_INPUT = "input#userId";
    private static final String SECRET_KEY_INPUT = "input#secretKey";
    private static final String ROLE_SELECT = "[role='combobox']";
    private static final String MAKE_ADMIN_BUTTON = "//button[contains(text(), 'Update Role')] | //button[contains(text(), 'Make admin')]";
    private static final String SUCCESS_ALERT = "[variant='success'], .alert";
    private static final String ERROR_ALERT = "[variant='destructive']";
    
    public AdminToolPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }
    
    /**
     * navigate to the admin tool page
     */
    public void navigateToAdminTool() {
        driver.get("http://localhost:3000/admin-tool");
        try { 
            Thread.sleep(5000); // wait longer for useEffect to load user data
        } catch (InterruptedException e) {}
        
        // debug current state
        System.out.println("Admin tool page loaded - URL: " + driver.getCurrentUrl());
        System.out.println("Page title: " + driver.getTitle());
        
        // check if we're actually logged in
        String pageSource = driver.getPageSource();
        if (pageSource.contains("login") || pageSource.contains("sign in")) {
            System.out.println("⚠ Warning: Appears to be redirected to login - user might not be authenticated");
        }
        
        if (pageSource.contains("Admin Role Manager")) {
            System.out.println("✓ Admin Role Manager found on page");
        } else {
            System.out.println("⚠ Warning: Admin Role Manager not found on page");
        }
    }
    
    /**
     * check if admin tool page is loaded properly
     */
    public boolean isAdminToolPageLoaded() {
        try {
            Thread.sleep(3000); // wait for React useEffect to populate fields
            
            String pageSource = driver.getPageSource();
            boolean hasTitle = pageSource.contains("Admin Role Manager");
            boolean hasUserIdInput = isElementPresent(USER_ID_INPUT);
            boolean hasSecretKeyInput = isElementPresent(SECRET_KEY_INPUT);
            
            System.out.println("AdminTool page check - Title: " + hasTitle + 
                            ", UserID input: " + hasUserIdInput + 
                            ", SecretKey input: " + hasSecretKeyInput);
            
            if (!hasTitle) {
                System.out.println("⚠ Admin Role Manager title not found");
                System.out.println("Page source contains: " + pageSource.substring(0, Math.min(500, pageSource.length())));
            }
            
            return hasTitle && hasUserIdInput && hasSecretKeyInput;
            
        } catch (Exception e) {
            System.out.println("Error checking admin tool page: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * get the user ID that's pre-populated in the form
     */
    public String getCurrentUserId() {
        try {
            // wait longer for form to be populated by useEffect
            Thread.sleep(5000);
            
            // first check if the input exists
            if (!isElementPresent(USER_ID_INPUT)) {
                System.out.println("✗ User ID input element not found on page");
                
                // debug: show what inputs ARE on the page
                try {
                    var inputs = driver.findElements(By.tagName("input"));
                    System.out.println("Found " + inputs.size() + " input elements:");
                    for (int i = 0; i < Math.min(inputs.size(), 5); i++) {
                        var input = inputs.get(i);
                        System.out.println("  Input " + i + ": id=" + input.getAttribute("id") + 
                                         ", name=" + input.getAttribute("name") + 
                                         ", placeholder=" + input.getAttribute("placeholder"));
                    }
                } catch (Exception e2) {
                    System.out.println("Could not enumerate inputs: " + e2.getMessage());
                }
                
                return "";
            }
            
            WebElement userIdInput = driver.findElement(By.cssSelector(USER_ID_INPUT));
            String userId = userIdInput.getAttribute("value");
            if (userId == null) userId = "";
            System.out.println("Current user ID from form: " + userId);
            return userId;
        } catch (Exception e) {
            System.out.println("Error getting user ID: " + e.getMessage());
            
            // additional debugging
            System.out.println("Current URL: " + driver.getCurrentUrl());
            String pageSource = driver.getPageSource();
            if (pageSource.contains("login")) {
                System.out.println("⚠ Page contains 'login' - user might not be authenticated");
            }
            
            return "";
        }
    }
    
    /**
     * promote current user to admin with proper success detection
     * based on actual AdminTool.tsx implementation
     */
    public boolean promoteToAdmin() {
        try {
            System.out.println("Starting admin promotion...");
            
            // wait for form to be ready (user data loaded)
            Thread.sleep(3000);

            String userId = getCurrentUserId();
            if (userId == null || userId.isEmpty()) {
                System.out.println("✗ User ID not populated, form not ready");
                return false;
            }
            System.out.println("✓ User ID populated: " + userId);
            
            // verify secret key is pre-filled
            WebElement secretKeyInput = driver.findElement(By.cssSelector(SECRET_KEY_INPUT));
            String secretKey = secretKeyInput.getAttribute("value");
            if (!"WISS_ADMIN_SETUP_2024".equals(secretKey)) {
                System.out.println("✗ Secret key not pre-filled correctly: " + secretKey);
                return false;
            }
            System.out.println("✓ Secret key pre-filled correctly");
            
            // store original URL to detect redirect
            String originalUrl = driver.getCurrentUrl();
            System.out.println("Original URL: " + originalUrl);
            
            // find and click the "Make admin" button (based on AdminTool.tsx: `Make ${role.toLowerCase()}`)
            WebElement submitButton = null;
            try {
                submitButton = driver.findElement(By.xpath("//button[contains(text(), 'Make admin')]"));
            } catch (Exception e1) {
                try {
                    // fallback to any button that contains "Make"
                    submitButton = driver.findElement(By.xpath("//button[contains(text(), 'Make')]"));
                } catch (Exception e2) {
                    try {
                        // last fallback to any submit button
                        submitButton = driver.findElement(By.cssSelector("button[type='submit']"));
                    } catch (Exception e3) {
                        System.out.println("✗ Could not find submit button");
                        return false;
                    }
                }
            }
            
            // scroll to button and click
            JavascriptExecutor js = (JavascriptExecutor) driver;
            js.executeScript("arguments[0].scrollIntoView(true);", submitButton);
            Thread.sleep(500);
            submitButton.click();
            System.out.println("✓ Clicked submit button");
            
            // check for success - AdminTool shows success message then auto-logs out after 5 seconds
            boolean success = false;
            
            // phase 1: look for success message (should appear immediately)
            for (int i = 0; i < 3; i++) {
                Thread.sleep(1000);
                System.out.println("Phase 1 - Check " + (i+1) + " for success message");
                
                // method 1: check for success alert with specific variant
                try {
                    WebElement successAlert = driver.findElement(By.cssSelector("[role='alert'][data-slot='alert']"));
                    if (successAlert.isDisplayed()) {
                        String alertText = successAlert.getText().toLowerCase();
                        if (alertText.contains("success") && (alertText.contains("admin") || alertText.contains("role"))) {
                            System.out.println("✓ Success alert found: " + alertText);
                            success = true;
                            break;
                        }
                    }
                } catch (Exception e) {
                    // no success alert found
                }
                
                // method 2: check page source for success message
                String pageSource = driver.getPageSource().toLowerCase();
                if (pageSource.contains("user has been made a") && pageSource.contains("successfully")) {
                    System.out.println("✓ Success message found in page source");
                    success = true;
                    break;
                }
                
                // method 3: check for specific success text
                try {
                    WebElement successElement = driver.findElement(By.xpath("//*[contains(text(), 'successfully') and contains(text(), 'admin')]"));
                    if (successElement.isDisplayed()) {
                        System.out.println("✓ Success element found: " + successElement.getText());
                        success = true;
                        break;
                    }
                } catch (Exception e) {
                    // no success element found
                }
            }
            
            if (!success) {
                // check for error messages before declaring failure
                String pageSource = driver.getPageSource().toLowerCase();
                if (pageSource.contains("error") || pageSource.contains("failed")) {
                    System.out.println("✗ Error detected in response");
                    return false;
                }
                System.out.println("⚠ No clear success message found, but no error either");
            }
            
            // phase 2: wait for auto-logout (AdminTool logs out after 5 seconds on success)
            System.out.println("Phase 2 - Waiting for auto-logout...");
            for (int i = 0; i < 8; i++) { // wait up to 8 seconds total
                Thread.sleep(1000);
                String currentUrl = driver.getCurrentUrl();
                System.out.println("Phase 2 - Check " + (i+1) + " - URL: " + currentUrl);
                
                // check if redirected to login (successful auto-logout)
                if (!currentUrl.equals(originalUrl) && currentUrl.contains("/login")) {
                    System.out.println("✓ Auto-logout successful - redirected to login");
                    return true; // This is the definitive success indicator
                }
            }
            
            // if we found success message but no auto-logout, it might still be successful
            // but the logout functionality might have changed
            if (success) {
                System.out.println("✓ Success message found, assuming promotion successful");
                return true;
            }
            
            System.out.println("✗ Admin promotion verification failed");
            return false;
            
        } catch (Exception e) {
            System.out.println("Error during admin promotion: " + e.getMessage());
            return false;
        }
    }
    
    /**
    * set a specific role (instead of just admin)
     */
    public boolean setUserRole(String role) {
        try {
            System.out.println("Setting user role to: " + role);
            
            // wait for form to load
            Thread.sleep(3000);
            
            // try to find and set role selector
            try {
                WebElement roleSelect = driver.findElement(By.cssSelector(ROLE_SELECT));
                roleSelect.click();
                Thread.sleep(1000);
                
                // find the role option
                WebElement roleOption = driver.findElement(By.xpath("//div[@role='option' and contains(text(), '" + role + "')]"));
                roleOption.click();
                System.out.println("✓ Selected role: " + role);
            } catch (Exception e) {
                System.out.println("Could not set role selector, using default");
            }
            
            // continue with submission (same as promoteToAdmin)
            return promoteToAdmin();
            
        } catch (Exception e) {
            System.out.println("Error setting user role: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * helper method to check if element exists by CSS selector
     */
    private boolean isElementPresent(String cssSelector) {
        try {
            return !driver.findElements(By.cssSelector(cssSelector)).isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
} 
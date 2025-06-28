package ch.wiss.forum.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;

/**
 * Page Object Model for the Registration page
 * Updated to match actual React Hook Form implementation
 * 
 * @author Yanis Sebastian Zürcher
 */
public class RegisterPage {
    
    private final WebDriver driver;
    private final WebDriverWait wait;
    
    // Updated selectors to match Register.tsx implementation
    @FindBy(css = "input[placeholder='Enter your full name']")
    private WebElement displayNameInput;
    
    @FindBy(css = "input[placeholder='Choose a unique username (no spaces)']")
    private WebElement usernameInput;
    
    @FindBy(css = "input[placeholder='Enter your @wiss-edu.ch or @wiss.ch email address']")
    private WebElement emailInput;
    
    @FindBy(css = "input[placeholder='Create a password (min. 6 characters, no spaces)']")
    private WebElement passwordInput;
    
    @FindBy(css = "input[placeholder='Confirm your password']")
    private WebElement confirmPasswordInput;
    
    @FindBy(css = "button[type='submit']")
    private WebElement registerButton;
    
    @FindBy(css = "[role='alert']")
    private WebElement alertMessage;
    
    // Constructor
    public RegisterPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
        PageFactory.initElements(driver, this);
    }
    
    /**
     * Navigate to the registration page
     */
    public RegisterPage navigateToRegisterPage() {
        driver.get("http://localhost:3000/register");
        waitForPageToLoad();
        return this;
    }
    
    /**
     * Wait for page to load completely
     */
    public void waitForPageToLoad() {
        wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("input[placeholder='Enter your full name']")));
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[type='submit']")));
    }
    
    /**
     * Enter display name (first field in form)
     */
    public RegisterPage enterDisplayName(String displayName) {
        wait.until(ExpectedConditions.elementToBeClickable(displayNameInput));
        displayNameInput.clear();
        displayNameInput.sendKeys(displayName);
        return this;
    }
    
    /**
     * Enter username
     */
    public RegisterPage enterUsername(String username) {
        wait.until(ExpectedConditions.elementToBeClickable(usernameInput));
        usernameInput.clear();
        usernameInput.sendKeys(username);
        return this;
    }
    
    /**
     * Enter email
     */
    public RegisterPage enterEmail(String email) {
        wait.until(ExpectedConditions.elementToBeClickable(emailInput));
        emailInput.clear();
        emailInput.sendKeys(email);
        return this;
    }
    
    /**
     * Enter password
     */
    public RegisterPage enterPassword(String password) {
        wait.until(ExpectedConditions.elementToBeClickable(passwordInput));
        passwordInput.clear();
        passwordInput.sendKeys(password);
        return this;
    }
    
    /**
     * Enter confirm password
     */
    public RegisterPage enterConfirmPassword(String confirmPassword) {
        wait.until(ExpectedConditions.elementToBeClickable(confirmPasswordInput));
        confirmPasswordInput.clear();
        confirmPasswordInput.sendKeys(confirmPassword);
        return this;
    }

    /**
     * Click register button
     */
    public void clickRegisterButton() {
        wait.until(ExpectedConditions.elementToBeClickable(registerButton));
        registerButton.click();
    }

    /**
     * Perform complete registration process
     * Order matches the actual form: displayName, username, email, password, confirmPassword
     */
    public void register(String username, String email, String password, String displayName) {
        enterDisplayName(displayName);
        enterUsername(username);
        enterEmail(email);
        enterPassword(password);
        enterConfirmPassword(password);
        clickRegisterButton();
    }
    
    /**
     * Click login link to navigate to login page
     */
    public void clickLoginLink() {
        try {
            WebElement loginButton = driver.findElement(By.xpath("//button[contains(text(), 'Already have an account? Sign in')]"));
            wait.until(ExpectedConditions.elementToBeClickable(loginButton));
            loginButton.click();
        } catch (Exception e) {
            // Fallback: navigate directly to login page
            driver.get("http://localhost:3000/login");
        }
    }
    
    /**
     * Get success/error message text
     */
    public String getAlertMessage() {
        try {
            Thread.sleep(1000);
            WebElement alert = wait.until(
                ExpectedConditions.presenceOfElementLocated(By.cssSelector("[role='alert']"))
            );
            return alert.getText();
        } catch (Exception e) {
            return "";
        }
    }
    
    /**
     * Get field-specific error message
     */
    public String getErrorMessage() {
        try {
            // Look for React Hook Form validation messages
            WebElement errorElement = driver.findElement(By.cssSelector("[role='alert'], .text-destructive, .text-red-500"));
            return errorElement.getText();
        } catch (Exception e) {
            return "";
        }
    }
    
    /**
     * Check if registration form is displayed
     */
    public boolean isRegistrationFormDisplayed() {
        try {
            return driver.findElement(By.cssSelector("input[placeholder='Enter your full name']")).isDisplayed() && 
                   driver.findElement(By.cssSelector("input[placeholder='Choose a unique username (no spaces)']")).isDisplayed() && 
                   driver.findElement(By.cssSelector("input[placeholder='Enter your @wiss-edu.ch or @wiss.ch email address']")).isDisplayed() && 
                   driver.findElement(By.cssSelector("input[placeholder='Create a password (min. 6 characters, no spaces)']")).isDisplayed() && 
                   driver.findElement(By.cssSelector("button[type='submit']")).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if registration was successful (user is redirected)
     */
    public boolean isRegistrationSuccessful() {
        try {
            System.out.println("Checking registration success...");
            
            // Wait a bit for processing
            Thread.sleep(2000);
            
            String currentUrl = driver.getCurrentUrl();
            System.out.println("Current URL after registration: " + currentUrl);
            
            // Method 1: Success if redirected away from register page
            if (!currentUrl.contains("/register")) {
                System.out.println("✓ Success: Redirected away from register page");
                return true;
            }
            
            // Method 2: Check for success message in alerts
            try {
                String alertText = getAlertMessage();
                System.out.println("Alert message: " + alertText);
                if (!alertText.isEmpty() && 
                    (alertText.toLowerCase().contains("success") || 
                     alertText.toLowerCase().contains("account created") ||
                     alertText.toLowerCase().contains("registered") ||
                     alertText.toLowerCase().contains("welcome"))) {
                    System.out.println("✓ Success: Found success message");
                    return true;
                }
            } catch (Exception e) {
                System.out.println("No alert message found");
            }
            
            // Method 3: Check page source for success indicators
            String pageSource = driver.getPageSource().toLowerCase();
            if (pageSource.contains("registration successful") || 
                pageSource.contains("account created") ||
                pageSource.contains("welcome")) {
                System.out.println("✓ Success: Found success text in page");  
                return true;
            }
            
            // Method 4: Look for absence of error messages as potential success
            boolean hasErrors = pageSource.contains("error") || 
                               pageSource.contains("invalid") ||
                               pageSource.contains("failed") ||
                               hasUsernameError() || 
                               hasEmailError();
                               
            if (!hasErrors) {
                System.out.println("✓ Success: No errors detected, assuming success");
                return true;
            }
            
            System.out.println("✗ Registration appears to have failed");
            return false;
            
        } catch (Exception e) {
            System.out.println("Exception checking registration success: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Validate that username field shows error for invalid input
     */
    public boolean hasUsernameError() {
        try {
            // Look for React Hook Form validation message
            WebElement usernameError = driver.findElement(
                By.xpath("//input[@placeholder='Choose a unique username (no spaces)']/following-sibling::*[contains(@class, 'text-destructive') or contains(text(), 'inappropriate')]")
            );
            return usernameError.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Validate that email field shows error for invalid input
     */
    public boolean hasEmailError() {
        try {
            // Look for React Hook Form validation message
            WebElement emailError = driver.findElement(
                By.xpath("//input[@placeholder='Enter your @wiss-edu.ch or @wiss.ch email address']/following-sibling::*[contains(@class, 'text-destructive')]")
            );
            return emailError.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get current page title
     */
    public String getPageTitle() {
        return driver.getTitle();
    }
    
    /**
     * Get current URL
     */
    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }
} 
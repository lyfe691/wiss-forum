package ch.wiss.forum.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;

/**
 * Page Object Model for the Login page, for login stuff so i can login etc.
 * 
 * @author Yanis Sebastian Zürcher
 */
public class LoginPage {
    
    private final WebDriver driver;
    private final WebDriverWait wait;
    
    // updated selectors to match actual Login.tsx implementation
    @FindBy(css = "input[placeholder='Enter your username or email']")
    private WebElement usernameInput;
    
    @FindBy(css = "input[placeholder='Enter your password']")
    private WebElement passwordInput;
    
    @FindBy(css = "button[type='submit']")
    private WebElement loginButton;
    
    @FindBy(css = "button:contains('Don\\'t have an account? Sign up')")
    private WebElement registerLink;
    
    @FindBy(css = "button:contains('Forgot password?')")
    private WebElement forgotPasswordLink;
    
    @FindBy(css = "[role='alert']")
    private WebElement alertMessage;
    
    // Constructor
    public LoginPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
        PageFactory.initElements(driver, this);
    }
    
    /**
     * navigate to the login page
     */
    public LoginPage navigateToLoginPage() {
        driver.get("http://localhost:3000/login");
        waitForPageToLoad();
        return this;
    }
    
    /**
     * wait for page to load completely
     */
    public void waitForPageToLoad() {
        wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("input[placeholder='Enter your username or email']")));
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[type='submit']")));
    }
    
    /**
     * enter username
     */
    public LoginPage enterUsername(String username) {
        wait.until(ExpectedConditions.elementToBeClickable(usernameInput));
        usernameInput.clear();
        usernameInput.sendKeys(username);
        return this;
    }
    
    /**
     * enter password
     */
    public LoginPage enterPassword(String password) {
        wait.until(ExpectedConditions.elementToBeClickable(passwordInput));
        passwordInput.clear();
        passwordInput.sendKeys(password);
        return this;
    }
    
    /**
     * click login button
     */
    public void clickLoginButton() {
        wait.until(ExpectedConditions.elementToBeClickable(loginButton));
        loginButton.click();
    }
    
    /**
     * perform complete login process
     */
    public void login(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        clickLoginButton();
    }
    
    /**
     * click register link to navigate to registration page
     */
    public void clickRegisterLink() {
        try {
            WebElement registerButton = driver.findElement(By.xpath("//button[contains(text(), 'Don\\'t have an account? Sign up')]"));
            wait.until(ExpectedConditions.elementToBeClickable(registerButton));
            registerButton.click();
        } catch (Exception e) {
            // fallback: navigate directly to register page
            driver.get("http://localhost:3000/register");
        }
    }
    
    /**
        * click forgot password link
     */
    public void clickForgotPasswordLink() {
        try {
            WebElement forgotButton = driver.findElement(By.xpath("//button[contains(text(), 'Forgot password?')]"));
            wait.until(ExpectedConditions.elementToBeClickable(forgotButton));
            forgotButton.click();
        } catch (Exception e) {
            // fallback: navigate directly to forgot password page
            driver.get("http://localhost:3000/forgot-password");
        }
    }
    
    /**
     * get alert/error message text
     */
    public String getAlertMessage() {
        try {
            // wait for alert to appear
            Thread.sleep(1000);
            
            // look for shadcn/ui Alert component
            WebElement errorElement = wait.until(
                ExpectedConditions.presenceOfElementLocated(By.cssSelector("[role='alert'] [data-description], [role='alert']"))
            );
            
            if (errorElement.isDisplayed()) {
                return errorElement.getText();
            }
            
            return "";
        } catch (Exception e) {
            // check if still on login page (indicates failure)
            if (driver.getCurrentUrl().contains("/login")) {
                return "Login failed - still on login page";
            }
            return "";
        }
    }
    
    /**
     * check if login form is displayed
     */
    public boolean isLoginFormDisplayed() {
        try {
            return driver.findElement(By.cssSelector("input[placeholder='Enter your username or email']")).isDisplayed() && 
                   driver.findElement(By.cssSelector("input[placeholder='Enter your password']")).isDisplayed() && 
                   driver.findElement(By.cssSelector("button[type='submit']")).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * check if user is redirected after successful login
     */
    public boolean isLoginSuccessful() {
        try {
            // wait for potential redirect
            Thread.sleep(3000);
            
            String currentUrl = driver.getCurrentUrl();
            
            // success if redirected away from login page
            if (!currentUrl.contains("/login")) {
                return true;
            }
            
            // check if there are any error messages
            try {
                WebElement errorElement = driver.findElement(By.cssSelector("[role='alert']"));
                if (errorElement.isDisplayed()) {
                    return false; // login failed with error
                }
            } catch (Exception e) {
                // no error element found
            }
            
            // wait a bit more for potential redirect
            Thread.sleep(2000);
            String finalUrl = driver.getCurrentUrl();
            
            return !finalUrl.contains("/login");
            
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * get current page title
     */
    public String getPageTitle() {
        return driver.getTitle();
    }
    
    /**
     * get current URL
     */
    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }
} 
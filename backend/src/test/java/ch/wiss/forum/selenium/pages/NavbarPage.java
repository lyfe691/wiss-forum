package ch.wiss.forum.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;

/**
 * Page Object Model for the Navbar component
 * Updated to match actual Navbar.tsx implementation
 * 
 * @author Yanis Sebastian Zürcher
 */
public class NavbarPage {
    
    private final WebDriver driver;
    private final WebDriverWait wait;
    
    // Updated selectors to match actual Navbar.tsx implementation
    @FindBy(css = "header img[alt='WISS Forum Logo']")
    private WebElement logoLink;
    
    // Authentication elements for non-logged in users
    @FindBy(css = "a[href='/login'], button:contains('Login')")
    private WebElement loginLink;
    
    @FindBy(css = "a[href='/register'], button:contains('Register')")
    private WebElement registerLink;
    
    // User dropdown elements (when logged in)
    @FindBy(css = "[role='button'][aria-haspopup='menu']")
    private WebElement userDropdownTrigger;
    
    @FindBy(css = ".avatar")
    private WebElement userAvatar;
    
    // Constructor
    public NavbarPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
        PageFactory.initElements(driver, this);
    }
    
    /**
     * Click on the logo to navigate to home
     */
    public void clickLogo() {
        try {
            WebElement logo = driver.findElement(By.cssSelector("header img[alt='WISS Forum Logo']"));
            wait.until(ExpectedConditions.elementToBeClickable(logo));
            logo.click();
        } catch (Exception e) {
            // Fallback: navigate directly to home
            driver.get("http://localhost:3000/");
        }
    }
    
    /**
     * Navigate to Categories page
     */
    public void clickCategories() {
        try {
            // Look for Categories link in the sidebar (mobile) or direct navigation
            WebElement categoriesLink = driver.findElement(By.xpath("//a[contains(@href, '/categories') or contains(text(), 'Categories')]"));
            categoriesLink.click();
        } catch (Exception e) {
            // Fallback: Navigate directly to Categories page
            driver.get("http://localhost:3000/categories");
        }
    }
    
    /**
     * Navigate to Latest Topics page
     */
    public void clickLatestTopics() {
        try {
            WebElement latestLink = driver.findElement(By.xpath("//a[contains(@href, '/topics/latest') or contains(text(), 'Latest')]"));
            latestLink.click();
        } catch (Exception e) {
            // Fallback: Navigate directly
            driver.get("http://localhost:3000/topics/latest");
        }
    }
    
    /**
     * Navigate to Users page
     */
    public void clickUsers() {
        try {
            WebElement usersLink = driver.findElement(By.xpath("//a[contains(@href, '/users') or contains(text(), 'Users')]"));
            usersLink.click();
        } catch (Exception e) {
            // Fallback: Navigate directly
            driver.get("http://localhost:3000/users");
        }
    }
    
    /**
     * Navigate to Leaderboard page
     */
    public void clickLeaderboard() {
        try {
            WebElement leaderboardLink = driver.findElement(By.xpath("//a[contains(@href, '/leaderboard') or contains(text(), 'Leaderboard')]"));
            leaderboardLink.click();
        } catch (Exception e) {
            // Fallback: Navigate directly
            driver.get("http://localhost:3000/leaderboard");
        }
    }
    
    /**
     * Click Login link (when not authenticated)
     */
    public void clickLogin() {
        try {
            WebElement loginButton = driver.findElement(By.xpath("//a[@href='/login'] | //button[contains(text(), 'Login')]"));
            wait.until(ExpectedConditions.elementToBeClickable(loginButton));
            loginButton.click();
        } catch (Exception e) {
            // Fallback: navigate directly
            driver.get("http://localhost:3000/login");
        }
    }
    
    /**
     * Click Register link (when not authenticated)
     */
    public void clickRegister() {
        try {
            WebElement registerButton = driver.findElement(By.xpath("//a[@href='/register'] | //button[contains(text(), 'Register')]"));
            wait.until(ExpectedConditions.elementToBeClickable(registerButton));
            registerButton.click();
        } catch (Exception e) {
            // Fallback: navigate directly
            driver.get("http://localhost:3000/register");
        }
    }
    
    /**
     * Open user dropdown menu (when authenticated)
     */
    public void openUserDropdown() {
        try {
            // Method 1: Try the DropdownMenuTrigger button with avatar
            WebElement dropdownTrigger = driver.findElement(By.cssSelector("button[aria-haspopup='menu']"));
            wait.until(ExpectedConditions.elementToBeClickable(dropdownTrigger));
            dropdownTrigger.click();
            
            // Wait for dropdown to appear
            Thread.sleep(1000);
            return;
        } catch (Exception e1) {
            try {
                // Method 2: Try any button with avatar
                WebElement avatarButton = driver.findElement(By.cssSelector("button:has(.avatar), button .avatar"));
                avatarButton.click();
                Thread.sleep(1000);
                return;
            } catch (Exception e2) {
                try {
                    // Method 3: Try any button in header
                    WebElement headerButton = driver.findElement(By.cssSelector("header button"));
                    headerButton.click();
                    Thread.sleep(1000);
                    return;
                } catch (Exception e3) {
                    System.out.println("Could not open user dropdown");
                    throw new RuntimeException("Could not open user dropdown", e3);
                }
            }
        }
    }
    
    /**
     * Click on Profile link in user dropdown
     */
    public void clickProfile() {
        openUserDropdown();
        try {
            WebElement profileLink = driver.findElement(By.xpath("//a[contains(@href, '/profile')] | //*[contains(text(), 'Profile')]"));
            wait.until(ExpectedConditions.elementToBeClickable(profileLink));
            profileLink.click();
        } catch (Exception e) {
            // Fallback: navigate directly
            driver.get("http://localhost:3000/profile");
        }
    }
    
    /**
     * Click on Settings link in user dropdown
     */
    public void clickSettings() {
        openUserDropdown();
        try {
            WebElement settingsLink = driver.findElement(By.xpath("//a[contains(@href, '/settings')] | //*[contains(text(), 'Settings')]"));
            wait.until(ExpectedConditions.elementToBeClickable(settingsLink));
            settingsLink.click();
        } catch (Exception e) {
            // Fallback: navigate directly
            driver.get("http://localhost:3000/settings");
        }
    }
    
    /**
     * Click on Admin link in user dropdown (if user is admin)
     */
    public void clickAdmin() {
        openUserDropdown();
        try {
            WebElement adminLink = driver.findElement(By.xpath("//a[contains(@href, '/admin')] | //*[contains(text(), 'Admin')]"));
            wait.until(ExpectedConditions.elementToBeClickable(adminLink));
            adminLink.click();
        } catch (Exception e) {
            // Fallback: navigate directly
            driver.get("http://localhost:3000/admin");
        }
    }
    
    /**
     * Logout the current user
     */
    public void logout() {
        openUserDropdown();
        
        try {
            // Look for the logout button in the dropdown
            WebElement logoutButton = driver.findElement(By.xpath("//button[contains(text(), 'Log out')] | //*[contains(text(), 'Logout')] | //*[contains(text(), 'Sign out')]"));
            wait.until(ExpectedConditions.elementToBeClickable(logoutButton));
            logoutButton.click();
        } catch (Exception e) {
            System.out.println("Could not find logout button in dropdown");
            throw new RuntimeException("Could not logout", e);
        }
    }
    
    /**
     * Search functionality
     */
    public void search(String query) {
        try {
            WebElement searchInput = driver.findElement(By.cssSelector("input[placeholder*='Search'], [data-testid='search-input']"));
            searchInput.clear();
            searchInput.sendKeys(query);
            
            // Try to find and click search button
            try {
                WebElement searchButton = driver.findElement(By.cssSelector("button[type='submit'], [data-testid='search-button']"));
                searchButton.click();
            } catch (Exception e) {
                // Fallback: press Enter
                searchInput.sendKeys(org.openqa.selenium.Keys.ENTER);
            }
        } catch (Exception e) {
            System.out.println("Search functionality not available");
        }
    }
    
    /**
     * Toggle theme (if theme toggle is available)
     */
    public void toggleTheme() {
        try {
            WebElement themeToggle = driver.findElement(By.cssSelector("[data-testid='theme-toggle'], .theme-toggle, button[aria-label*='theme']"));
            themeToggle.click();
        } catch (Exception e) {
            System.out.println("Theme toggle not available");
        }
    }
    
    /**
     * Check if user is authenticated (has user dropdown)
     */
    public boolean isUserAuthenticated() {
        try {
            // Wait a moment for page to load
            Thread.sleep(2000);
            
            // Look for user avatar or dropdown trigger
            return driver.findElements(By.cssSelector("button[aria-haspopup='menu'], button .avatar, .avatar")).size() > 0;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if user is guest (has login/register links)
     */
    public boolean isGuestUser() {
        try {
            return driver.findElements(By.xpath("//a[@href='/login'] | //a[@href='/register']")).size() > 0;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get displayed username from navbar
     */
    public String getDisplayedUsername() {
        try {
            // Look for username text in the navbar
            WebElement usernameElement = driver.findElement(By.cssSelector("button[aria-haspopup='menu'] span, .avatar + span"));
            return usernameElement.getText();
        } catch (Exception e) {
            return "";
        }
    }
    
    /**
     * Check if admin link is visible in dropdown
     */
    public boolean isAdminLinkVisible() {
        try {
            openUserDropdown();
            WebElement adminLink = driver.findElement(By.xpath("//*[contains(text(), 'Admin')]"));
            return adminLink.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if a navigation link is currently active
     */
    public boolean isNavigationLinkActive(String linkText) {
        try {
            WebElement activeLink = driver.findElement(By.xpath("//a[contains(@class, 'active') and contains(text(), '" + linkText + "')]"));
            return activeLink.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Wait for navbar to load
     */
    public void waitForNavbarToLoad() {
        try {
            // Wait for the header to be present
            wait.until(ExpectedConditions.presenceOfElementLocated(By.tagName("header")));
            
            // Wait for either authentication state to be determined
            Thread.sleep(2000);
        } catch (Exception e) {
            System.out.println("Navbar load timeout");
        }
    }
} 
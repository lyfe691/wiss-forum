package ch.wiss.forum.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.util.List;
import org.openqa.selenium.JavascriptExecutor;

/**
 * Page Object Model for Category Management page, for role stuff so i can create a category etc.
 * 
 * @author Yanis Sebastian Zürcher
 */
public class CategoryManagementPage {
    
    private final WebDriver driver;
    private final WebDriverWait wait;
    
    public CategoryManagementPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }
    
    /**
     * navigate to category management page with proper auth verification
     */
    public void navigateTo() {
        System.out.println("Navigating to category management page...");
        
        // check current auth state before navigation
        String beforeUrl = driver.getCurrentUrl();
        System.out.println("URL before navigation: " + beforeUrl);
        
        driver.get("http://localhost:3000/admin/categories");
        
        // wait for page load and potential redirects
        try { 
            Thread.sleep(5000); // wait longer for React component to load and auth checks
        } catch (InterruptedException e) {}
        
        String afterUrl = driver.getCurrentUrl();
        System.out.println("URL after navigation: " + afterUrl);
        System.out.println("Page title: " + driver.getTitle());
        
        // check if we were redirected (indicates auth/role issue)
        if (!afterUrl.contains("/admin/categories")) {
            System.out.println("⚠ Redirected away from category management page!");
            System.out.println("Expected: http://localhost:3000/admin/categories");
            System.out.println("Actual: " + afterUrl);
            
            if (afterUrl.contains("/login")) {
                System.out.println("✗ Redirected to login - authentication issue");
                throw new RuntimeException("Authentication failed - redirected to login page");
            } else if (afterUrl.contains("/") && afterUrl.equals("http://localhost:3000/")) {
                System.out.println("✗ Redirected to home - likely role permission issue");
                
                // check what role the user currently has
                try {
                    // look for user info on the page or in localStorage
                    String pageSource = driver.getPageSource();
                    if (pageSource.contains("admin") || pageSource.contains("Admin")) {
                        System.out.println("Page mentions admin, role might be set");
                    } else {
                        System.out.println("No admin mentions found on page");
                    }
                    
                    // try to check localStorage for user data
                    Object userRole = ((JavascriptExecutor) driver).executeScript(
                        "const user = JSON.parse(localStorage.getItem('user') || '{}');" +
                        "return user.role || 'no role found';"
                    );
                    System.out.println("User role in localStorage: " + userRole);
                    
                } catch (Exception e) {
                    System.out.println("Could not check user role: " + e.getMessage());
                }
                
                throw new RuntimeException("Access denied - insufficient role permissions for category management");
            } else {
                System.out.println("✗ Redirected to unexpected page: " + afterUrl);
                throw new RuntimeException("Unexpected redirect to: " + afterUrl);
            }
        }
        
        System.out.println("✓ Successfully navigated to category management page");
    }
    
    /**
     * create a new category with strict verification based on actual CategoryManagement.tsx
     */
    public boolean createCategory(String name, String description) {
        try {
            System.out.println("Creating category: " + name);
            
            // count existing categories before creation
            int initialCategoryCount = getCategoryCount();
            System.out.println("Initial category count: " + initialCategoryCount);
            
            // 1. click "New Category" button
            WebElement newCategoryButton = null;
            try {

                newCategoryButton = driver.findElement(By.xpath("//button[contains(text(), 'New Category')]"));
                System.out.println("✓ Found 'New Category' button with text selector");
            } catch (Exception e) {
                try {
                    newCategoryButton = driver.findElement(By.xpath("//button[contains(., 'Create')]"));
                    System.out.println("✓ Found button with 'Create' text");
                } catch (Exception e2) {
                    try {
                        newCategoryButton = driver.findElement(By.xpath("//button[contains(., 'New')]"));
                        System.out.println("✓ Found button with 'New' text");
                    } catch (Exception e3) {
                        // print page source to debug
                        System.out.println("✗ Could not find New Category button");
                        System.out.println("Page source contains 'New Category': " + driver.getPageSource().contains("New Category"));
                        System.out.println("Page source contains 'Create': " + driver.getPageSource().contains("Create"));
                        System.out.println("Available buttons:");
                        java.util.List<WebElement> buttons = driver.findElements(By.tagName("button"));
                        for (int i = 0; i < Math.min(buttons.size(), 10); i++) {
                            WebElement btn = buttons.get(i);
                            if (btn.isDisplayed()) {
                                System.out.println("  - Button " + i + ": '" + btn.getText() + "'");
                            }
                        }
                        throw new RuntimeException("New Category button not found");
                    }
                }
            }
            
            if (newCategoryButton != null && newCategoryButton.isDisplayed() && newCategoryButton.isEnabled()) {
                newCategoryButton.click();
                System.out.println("✓ Clicked New Category button");
                Thread.sleep(2000); // wait for dialog to open
            } else {
                System.out.println("✗ New Category button not clickable");
                throw new RuntimeException("New Category button not clickable");
            }
            
            // verify dialog opened (Radix Dialog structure)
            try {
                WebElement dialog = driver.findElement(By.cssSelector("[data-slot='dialog-content'], [role='dialog']"));
                if (!dialog.isDisplayed()) {
                    System.out.println("✗ Dialog did not open properly");
                    return false;
                }
                System.out.println("✓ Dialog opened successfully");
            } catch (Exception e) {
                System.out.println("✗ Could not verify dialog opened: " + e.getMessage());
                return false;
            }
            
            // 2. fill form fields (based on CategoryManagement.tsx)
            try {
                WebElement nameInput = driver.findElement(By.id("name"));
                nameInput.clear();
                nameInput.sendKeys(name);
                
                // verify the input was filled
                String enteredName = nameInput.getAttribute("value");
                if (!name.equals(enteredName)) {
                    System.out.println("✗ Name input verification failed. Expected: " + name + ", Got: " + enteredName);
                    return false;
                }
                System.out.println("✓ Entered and verified category name: " + name);
            } catch (Exception e) {
                System.out.println("✗ Could not fill name input field: " + e.getMessage());
                return false;
            }
            
            try {
                WebElement descriptionInput = driver.findElement(By.id("description"));
                descriptionInput.clear();
                descriptionInput.sendKeys(description);
                
                // verify the input was filled
                String enteredDescription = descriptionInput.getAttribute("value");
                if (!description.equals(enteredDescription)) {
                    System.out.println("✗ Description input verification failed. Expected: " + description + ", Got: " + enteredDescription);
                    return false;
                }
                System.out.println("✓ Entered and verified category description: " + description);
            } catch (Exception e) {
                System.out.println("✗ Could not fill description input field: " + e.getMessage());
                return false;
            }
            
            // 3. submit the form
            try {
                WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));
                if (!submitButton.isEnabled()) {
                    System.out.println("✗ Submit button is disabled");
                    return false;
                }
                submitButton.click();
                System.out.println("✓ Clicked submit button");
            } catch (Exception e) {
                try {
                    WebElement createButton = driver.findElement(By.xpath("//button[contains(text(), 'Create') or contains(text(), 'Save')]"));
                    if (!createButton.isEnabled()) {
                        System.out.println("✗ Create button is disabled");
                        return false;
                    }
                    createButton.click();
                    System.out.println("✓ Clicked create/save button");
                } catch (Exception e2) {
                    System.out.println("✗ Could not find or click submit button: " + e2.getMessage());
                    return false;
                }
            }
            
            // 4. wait for processing and strict success verification
            System.out.println("Waiting for category creation to complete...");
            Thread.sleep(3000); // wait for form submission
            
            // method 1: check for specific success message "Category created successfully"
            boolean hasSuccessMessage = false;
            try {
                // check for the exact success message from CategoryManagement.tsx
                WebElement successAlert = driver.findElement(By.xpath("//*[contains(text(), 'Category created successfully')]"));
                if (successAlert.isDisplayed()) {
                    System.out.println("✓ Found exact success message: Category created successfully");
                    hasSuccessMessage = true;
                }
            } catch (Exception e) {
                System.out.println("Exact success message not found");
            }
            
            // method 2: verify dialog is closed (indicates success in React)
            boolean dialogClosed = false;
            try {
                WebElement dialog = driver.findElement(By.cssSelector("[data-slot='dialog-content'], [role='dialog']"));
                if (!dialog.isDisplayed()) {
                    System.out.println("✓ Dialog closed (indicates success)");
                    dialogClosed = true;
                }
            } catch (Exception e) {
                // dialog not found means it was closed
                System.out.println("✓ Dialog no longer exists (indicates success)");
                dialogClosed = true;
            }
            
            // wait for list refresh (CategoryManagement calls await fetchCategories() after success)
            Thread.sleep(2000);
            
            // method 3: verify category appears in the list (most important check)
            boolean categoryInList = false;
            try {
                // check if the new category appears in the table (name is in a div inside td)
                WebElement newCategoryElement = driver.findElement(By.xpath("//div[@class='font-medium' and contains(text(), '" + name + "')]"));
                if (newCategoryElement.isDisplayed()) {
                    System.out.println("✓ New category found in list: " + name);
                    categoryInList = true;
                }
            } catch (Exception e) {
                // try alternative selector in case class name is different
                try {
                    WebElement altCategoryElement = driver.findElement(By.xpath("//td//div[contains(text(), '" + name + "')]"));
                    if (altCategoryElement.isDisplayed()) {
                        System.out.println("✓ New category found in list (alternative selector): " + name);
                        categoryInList = true;
                    }
                } catch (Exception e2) {
                    System.out.println("✗ Category not found in list: " + e.getMessage());
                    System.out.println("✗ Alternative selector also failed: " + e2.getMessage());
                }
            }
            
            // method 4: verify category count increased
            boolean countIncreased = false;
            try {
                int finalCategoryCount = getCategoryCount();
                if (finalCategoryCount > initialCategoryCount) {
                    System.out.println("✓ Category count increased from " + initialCategoryCount + " to " + finalCategoryCount);
                    countIncreased = true;
                } else {
                    System.out.println("✗ Category count did not increase. Before: " + initialCategoryCount + ", After: " + finalCategoryCount);
                }
            } catch (Exception e) {
                System.out.println("Could not verify category count: " + e.getMessage());
            }
            
            // success requires dialog closed AND category in list AND count increased
            // (success message is nice to have but not always reliable)
            boolean success = dialogClosed && categoryInList && countIncreased;
            
            System.out.println("Category creation verification:");
            System.out.println("  - Success message: " + hasSuccessMessage);
            System.out.println("  - Dialog closed: " + dialogClosed);
            System.out.println("  - Category in list: " + categoryInList);
            System.out.println("  - Count increased: " + countIncreased);
            System.out.println("  - Overall result: " + success);
            
            return success;
            
        } catch (Exception e) {
            System.out.println("✗ Error creating category: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Check if category management page is loaded
     */
    public boolean isCategoryManagementPageLoaded() {
        try {
            Thread.sleep(2000); // wait for page to load
            
            boolean hasTitle = driver.getPageSource().contains("Category Management") || 
                              driver.getPageSource().contains("Categories");
            boolean hasNewCategoryButton = driver.findElements(By.xpath("//button[contains(text(), 'New Category')]")).size() > 0;
            boolean hasTable = driver.findElements(By.cssSelector("table, [role='table']")).size() > 0;
            
            System.out.println("Page loaded check - Title: " + hasTitle + 
                            ", New Category button: " + hasNewCategoryButton + 
                            ", Table: " + hasTable);
            
            return hasTitle && hasNewCategoryButton;
            
        } catch (Exception e) {
            System.out.println("Error checking page load: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Get list of existing categories
     */
    public int getCategoryCount() {
        try {
            // count rows in the category table (excluding header)
            List<WebElement> categoryRows = driver.findElements(By.cssSelector("table tbody tr, [role='table'] [role='row']:not(:first-child)"));
            return categoryRows.size();
        } catch (Exception e) {
            System.out.println("Error counting categories: " + e.getMessage());
            return 0;
        }
    }
    
    /**
     * Check if a specific category exists in the list
     */
    public boolean categoryExists(String categoryName) {
        try {
            // check if the category appears in the table (name is in a div inside td)
            WebElement categoryElement = driver.findElement(By.xpath("//div[@class='font-medium' and contains(text(), '" + categoryName + "')]"));
            return categoryElement.isDisplayed();
        } catch (Exception e) {
            // try alternative selector in case class name is different
            try {
                WebElement altCategoryElement = driver.findElement(By.xpath("//td//div[contains(text(), '" + categoryName + "')]"));
                return altCategoryElement.isDisplayed();
            } catch (Exception e2) {
                return false;
            }
        }
    }
    
    /**
     * Delete a category by name
     */
    public boolean deleteCategory(String categoryName) {
        try {
            System.out.println("Deleting category: " + categoryName);
            
            // find the category row and delete button
            WebElement deleteButton = driver.findElement(By.xpath(
                "//td[contains(text(), '" + categoryName + "')]/following-sibling::td//button[contains(@class, 'destructive') or contains(text(), 'Delete')]"
            ));
            
            deleteButton.click();
            Thread.sleep(1000);
            
            // confirm deletion if confirmation dialog appears
            try {
                WebElement confirmButton = driver.findElement(By.xpath("//button[contains(text(), 'Delete') or contains(text(), 'Confirm')]"));
                confirmButton.click();
                System.out.println("✓ Confirmed deletion");
            } catch (Exception e) {
                // no confirmation dialog
            }
            
            Thread.sleep(2000);
            
            // check if category is no longer in the list
            return !categoryExists(categoryName);
            
        } catch (Exception e) {
            System.out.println("Error deleting category: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Force refresh auth context to ensure role updates are reflected
     */
    public void forceAuthRefresh() {
        try {
            System.out.println("Forcing auth context refresh...");
            
            // method 1: try to trigger token refresh via JavaScript
            try {
                ((JavascriptExecutor) driver).executeScript(
                    "if (window.localStorage.getItem('token')) {" +
                        "fetch('/api/auth/refresh', {" +
                            "method: 'POST'," +
                            "headers: {" +
                                "'Authorization': 'Bearer ' + window.localStorage.getItem('token')" +
                            "}" +
                        "})" +
                        ".then(response => response.json())" +
                        ".then(data => {" +
                            "if (data.user) {" +
                                "window.localStorage.setItem('user', JSON.stringify(data.user));" +
                                "console.log('Auth refreshed:', data.user);" +
                            "}" +
                        "})" +
                        ".catch(err => console.log('Auth refresh failed:', err));" +
                    "}"
                );
                Thread.sleep(2000);
                System.out.println("✓ Triggered auth refresh via JavaScript");
            } catch (Exception e) {
                System.out.println("JavaScript auth refresh failed: " + e.getMessage());
            }
            
            // method 2: navigate to a protected route that forces auth check
            System.out.println("Triggering auth check via protected route...");
            driver.get("http://localhost:3000/profile");
            Thread.sleep(3000);
            
            // method 3: check if we can get updated user info
            try {
                Object userRole = ((JavascriptExecutor) driver).executeScript(
                    "const user = JSON.parse(localStorage.getItem('user') || '{}');" +
                    "return user.role || 'no role found';"
                );
                System.out.println("User role after auth refresh: " + userRole);
            } catch (Exception e) {
                System.out.println("Could not verify user role after refresh");
            }
            
        } catch (Exception e) {
            System.out.println("Error during auth refresh: " + e.getMessage());
        }
    }
} 
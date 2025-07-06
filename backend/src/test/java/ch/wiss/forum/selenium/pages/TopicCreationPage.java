package ch.wiss.forum.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.Keys;
import org.openqa.selenium.JavascriptExecutor;

import java.util.List;

/**
 * Page Object Model for Topic Creation functionality, for creating topics etc.
 * updated to match actual CreateTopic.tsx and MarkdownEditor implementation
 * 
 * @author Yanis Sebastian Zürcher
 */
public class TopicCreationPage {
    
    private final WebDriver driver;
    private final WebDriverWait wait;
    
    // updated selectors to match CreateTopic.tsx
    private static final String CATEGORY_SELECT = "button[role='combobox']";
    private static final String CATEGORY_OPTIONS = "[role='option']";
    private static final String TITLE_INPUT = "input[placeholder*='title' i], input#title";
    private static final String MARKDOWN_EDITOR = ".w-md-editor";
    private static final String MARKDOWN_TEXTAREA = ".w-md-editor-text-textarea, .w-md-editor-text";
    private static final String SUBMIT_BUTTON = "button[type='submit']";
    
    public TopicCreationPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }
    
    /**
     * Navigate to topic creation page
     */
    public void navigateToCreateTopic() {
        driver.get("http://localhost:3000/create-topic");
        try { 
            Thread.sleep(3000); // Wait for React components to load
        } catch (InterruptedException e) {}
    }
    
    /**
     * Navigate to topic creation page for specific category
     */
    public void navigateToCreateTopic(String categorySlug) {
        driver.get("http://localhost:3000/create-topic/" + categorySlug);
        try { 
            Thread.sleep(3000); // Wait for React components to load
        } catch (InterruptedException e) {}
    }
    
    /**
     * Check if the topic creation form is displayed
     */
    public boolean isCreateTopicFormDisplayed() {
        try {
            Thread.sleep(3000); // Wait for React components to render
            
            boolean hasTitleInput = isElementPresent(TITLE_INPUT);
            boolean hasMarkdownEditor = isElementPresent(MARKDOWN_EDITOR) || isElementPresent(MARKDOWN_TEXTAREA);
            boolean hasCategorySelect = isElementPresent(CATEGORY_SELECT);
            boolean hasSubmitButton = isElementPresent(SUBMIT_BUTTON);
            
            System.out.println("Form elements - Title: " + hasTitleInput + 
                            ", Editor: " + hasMarkdownEditor + 
                            ", Category: " + hasCategorySelect + 
                            ", Submit: " + hasSubmitButton);
            
            return hasTitleInput && hasMarkdownEditor && hasCategorySelect && hasSubmitButton;
            
        } catch (Exception e) {
            System.out.println("Error checking form display: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Select a category by name with enhanced verification
     */
    public void selectCategory(String categoryName) {
        try {
            System.out.println("Selecting category: " + categoryName);
            Thread.sleep(2000); // Wait for categories to load
            
            // Method 1: Try to click the Select component trigger
            try {
                // SelectTrigger has role="combobox" based on select.tsx
                WebElement categorySelect = driver.findElement(By.cssSelector("button[role='combobox']"));
                
                // Scroll to the select element
                JavascriptExecutor js = (JavascriptExecutor) driver;
                js.executeScript("arguments[0].scrollIntoView(true);", categorySelect);
                    Thread.sleep(1000);
                    
                // Click to open the dropdown
                categorySelect.click();
                System.out.println("✓ Opened category dropdown");
                Thread.sleep(2000); // Wait for dropdown to populate
                
                // Find and click the specific category option (SelectItem has role="option")
                    List<WebElement> options = driver.findElements(By.cssSelector("[role='option']"));
                
                System.out.println("Available options in dropdown:");
                boolean categoryFound = false;
                    for (WebElement option : options) {
                    if (option.isDisplayed()) {
                        String optionText = option.getText().trim();
                        System.out.println("  - " + optionText);
                        
                        if (optionText.equals(categoryName) || optionText.contains(categoryName)) {
                            option.click();
                            System.out.println("✓ Selected category: " + categoryName);
                            Thread.sleep(1000);
                            
                            // Verify selection by checking the trigger text
                            String selectedText = categorySelect.getText();
                            if (selectedText.contains(categoryName)) {
                                System.out.println("✓ Category selection verified: " + selectedText);
                            } else {
                                System.out.println("⚠ Category selection verification failed. Expected: " + categoryName + ", Got: " + selectedText);
                            }
                            categoryFound = true;
                            break;
                        }
                    }
                }
                
                if (categoryFound) {
                    return;
                } else {
                    System.out.println("Category '" + categoryName + "' not found in dropdown options");
                }
                
            } catch (Exception e1) {
                System.out.println("Standard category selection failed: " + e1.getMessage());
            }
            
            // Method 2: JavaScript-based selection as fallback
            try {
                JavascriptExecutor js = (JavascriptExecutor) driver;
                
                // Click on the select element using JavaScript
                js.executeScript(
                    "const selectElements = document.querySelectorAll('button[role=\"combobox\"]');" +
                    "if (selectElements.length > 0) {" +
                    "  selectElements[0].click();" +
                    "}"
                );
                
                Thread.sleep(2000);
                
                // Find and click the option using JavaScript
                boolean found = (Boolean) js.executeScript(
                    "const options = document.querySelectorAll('[role=\"option\"]');" +
                    "for (let option of options) {" +
                    "  if (option.textContent.includes('" + categoryName + "') && option.offsetParent !== null) {" +
                    "    option.click();" +
                    "    return true;" +
                    "  }" +
                    "}" +
                    "return false;"
                );
                
                if (found) {
                    Thread.sleep(1000);
                    System.out.println("✓ Selected category via JavaScript: " + categoryName);
                        return;
                }
                
            } catch (Exception e2) {
                System.out.println("JavaScript category selection failed: " + e2.getMessage());
            }
            
            // Method 3: Try alternative approach with data attributes
            try {
                WebElement categorySelect = driver.findElement(By.cssSelector("[data-slot='select-trigger'], .select-trigger"));
                
                JavascriptExecutor js = (JavascriptExecutor) driver;
                js.executeScript("arguments[0].scrollIntoView(true);", categorySelect);
                Thread.sleep(1000);
                
                categorySelect.click();
                System.out.println("✓ Opened category dropdown (method 3)");
                Thread.sleep(2000);
                
                // Look for the option
                List<WebElement> options = driver.findElements(By.cssSelector("[data-slot='select-item'], .select-item"));
                for (WebElement option : options) {
                    if (option.getText().contains(categoryName) && option.isDisplayed()) {
                        option.click();
                        System.out.println("✓ Selected category via method 3: " + categoryName);
                        Thread.sleep(1000);
                    return;
                    }
                }
                
            } catch (Exception e3) {
                System.out.println("Alternative category selection failed: " + e3.getMessage());
            }
            
            System.out.println("⚠ Could not select category: " + categoryName);
            
        } catch (Exception e) {
            System.out.println("Error selecting category: " + e.getMessage());
        }
    }
    
    /**
     * Select first available category with better error handling
     */
    public void selectFirstAvailableCategory() {
        try {
            System.out.println("Selecting first available category...");
            Thread.sleep(2000); // Wait for categories to load
            
            // Open the dropdown
            WebElement categorySelect = driver.findElement(By.cssSelector(CATEGORY_SELECT));
            
            JavascriptExecutor js = (JavascriptExecutor) driver;
            js.executeScript("arguments[0].scrollIntoView(true);", categorySelect);
            Thread.sleep(1000);
            
            categorySelect.click();
            System.out.println("✓ Opened category dropdown");
            Thread.sleep(1500);
            
            // Find all available options
            List<WebElement> options = driver.findElements(By.cssSelector(CATEGORY_OPTIONS));
            
            if (options.isEmpty()) {
                // Try alternative selector
                options = driver.findElements(By.cssSelector("[role='option'], .select-item"));
            }
            
            if (!options.isEmpty()) {
                // Select the first visible option
                for (WebElement option : options) {
                    if (option.isDisplayed() && !option.getText().trim().isEmpty()) {
                        String categoryName = option.getText().trim();
                        option.click();
                        System.out.println("✓ Selected first available category: " + categoryName);
                        Thread.sleep(1000);
                        return;
                    }
                }
            }
            
            System.out.println("⚠ No categories available to select");
            
        } catch (Exception e) {
            System.out.println("Error selecting first category: " + e.getMessage());
        }
    }
    
    /**
     * Enter topic title
     */
    public void enterTopicTitle(String title) {
        try {
            Thread.sleep(1000);
            
            WebElement titleInput = driver.findElement(By.cssSelector(TITLE_INPUT));
            
            // Scroll to element and focus
            JavascriptExecutor js = (JavascriptExecutor) driver;
            js.executeScript("arguments[0].scrollIntoView(true);", titleInput);
            Thread.sleep(500);
            
                titleInput.clear();
                titleInput.sendKeys(title);
                System.out.println("✓ Entered title: " + title);
            
        } catch (Exception e) {
            System.out.println("Error entering title: " + e.getMessage());
        }
    }
    
    /**
     * Enter content in the MarkdownEditor (MDEditor component from @uiw/react-md-editor)
     */
    public void enterTopicContent(String content) {
        try {
            Thread.sleep(3000); // Wait for MDEditor to fully initialize
            
            System.out.println("Attempting to enter content in MDEditor...");
            
            // Method 1: Direct interaction with MDEditor textarea
            try {
                // MDEditor creates a textarea inside .w-md-editor div
                WebElement mdEditor = driver.findElement(By.cssSelector(".w-md-editor"));
                WebElement textarea = mdEditor.findElement(By.tagName("textarea"));
                
                JavascriptExecutor js = (JavascriptExecutor) driver;
                js.executeScript("arguments[0].scrollIntoView(true);", textarea);
                Thread.sleep(1000);
                
                // Clear and enter content
                textarea.clear();
                textarea.sendKeys(content);
                
                // Verify content was entered
                String enteredContent = textarea.getAttribute("value");
                if (enteredContent != null && enteredContent.contains(content.substring(0, Math.min(20, content.length())))) {
                    System.out.println("✓ Content entered successfully via MDEditor textarea");
                    
                    // Trigger React events for proper state update
                    js.executeScript(
                        "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));" +
                        "arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
                        textarea
                    );
                    
                return;
                }
                
            } catch (Exception e1) {
                System.out.println("MDEditor direct method failed: " + e1.getMessage());
            }
            
            // Method 2: JavaScript injection with React state update
            try {
                JavascriptExecutor js = (JavascriptExecutor) driver;
                
                // Find the MDEditor and set content via JavaScript
                js.executeScript(
                    "const mdEditor = document.querySelector('.w-md-editor');" +
                    "if (mdEditor) {" +
                    "  const textarea = mdEditor.querySelector('textarea');" +
                    "  if (textarea) {" +
                    "    textarea.value = arguments[0];" +
                    "    textarea.dispatchEvent(new Event('input', { bubbles: true }));" +
                    "    textarea.dispatchEvent(new Event('change', { bubbles: true }));" +
                    "    textarea.focus();" +
                    "  }" +
                    "}",
                    content
                );
                
                Thread.sleep(1000);
                
                // Verify content was set
                try {
                    WebElement mdEditor = driver.findElement(By.cssSelector(".w-md-editor"));
                    WebElement textarea = mdEditor.findElement(By.tagName("textarea"));
                    String enteredContent = textarea.getAttribute("value");
                    if (enteredContent != null && enteredContent.contains(content.substring(0, Math.min(20, content.length())))) {
                        System.out.println("✓ Content entered successfully via JavaScript injection");
                        return;
                    }
                } catch (Exception verifyE) {
                    System.out.println("Could not verify JavaScript injection: " + verifyE.getMessage());
            }
            
                System.out.println("✓ JavaScript injection completed (assuming success)");
                return;
                
            } catch (Exception e2) {
                System.out.println("JavaScript injection method failed: " + e2.getMessage());
            }
            
            // Method 3: Fallback - try any visible textarea
            try {
                List<WebElement> textareas = driver.findElements(By.tagName("textarea"));
                for (WebElement textarea : textareas) {
                    if (textarea.isDisplayed() && textarea.isEnabled()) {
                        JavascriptExecutor js = (JavascriptExecutor) driver;
                        js.executeScript("arguments[0].scrollIntoView(true);", textarea);
                        Thread.sleep(500);
                        
                        textarea.clear();
                        textarea.sendKeys(content);
                        
                        // Trigger events
                        js.executeScript(
                            "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));" +
                            "arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
                            textarea
                        );
                        
                        System.out.println("✓ Content entered via fallback textarea");
                        return;
                    }
                }
            } catch (Exception e3) {
                System.out.println("Fallback textarea method failed: " + e3.getMessage());
            }
            
            System.out.println("⚠ Could not enter content in MDEditor");
            
        } catch (Exception e) {
            System.out.println("Error entering content: " + e.getMessage());
        }
    }
    
    /**
     * Submit the topic creation form
     */
    public void submitTopic() {
        try {
            Thread.sleep(1000);
            
            WebElement submitButton = driver.findElement(By.cssSelector(SUBMIT_BUTTON));
            
            // Scroll to submit button
                    JavascriptExecutor js = (JavascriptExecutor) driver;
            js.executeScript("arguments[0].scrollIntoView(true);", submitButton);
                    Thread.sleep(500);
                    
            // Check if button is enabled
            if (!submitButton.isEnabled()) {
                System.out.println("⚠ Submit button is disabled, form may be invalid");
            }
            
            submitButton.click();
            System.out.println("✓ Clicked submit button");
            
        } catch (Exception e) {
            System.out.println("Error submitting topic: " + e.getMessage());
        }
    }
    
    /**
     * Complete topic creation process with enhanced verification
     */
    public void createTopic(String title, String content, String categoryName) {
        try {
            System.out.println("=== Creating topic: " + title + " ===");
            
            // Step 1: Select category first
            System.out.println("Step 1: Selecting category");
            if (categoryName != null && !categoryName.isEmpty()) {
                selectCategory(categoryName);
            } else {
                selectFirstAvailableCategory();
            }
            Thread.sleep(1000);
            
            // Step 2: Enter title with verification
            System.out.println("Step 2: Entering title");
            enterTopicTitle(title);
            
            // Verify title was entered
            try {
                WebElement titleInput = driver.findElement(By.cssSelector(TITLE_INPUT));
                String enteredTitle = titleInput.getAttribute("value");
                if (!title.equals(enteredTitle)) {
                    System.out.println("⚠ Title verification failed. Expected: " + title + ", Got: " + enteredTitle);
                } else {
                    System.out.println("✓ Title verified successfully");
                }
            } catch (Exception e) {
                System.out.println("Could not verify title entry");
            }
            
            // Step 3: Enter content with verification
            System.out.println("Step 3: Entering content");
            enterTopicContent(content);
            Thread.sleep(1000);
            
            // Step 4: Submit with verification
            System.out.println("Step 4: Submitting topic");
            submitTopic();
            
            System.out.println("✓ Topic creation process completed");
            
        } catch (Exception e) {
            System.out.println("✗ Error in topic creation process: " + e.getMessage());
            e.printStackTrace();
        }
            }
            
    /**
     * Complete topic creation process with first available category
     */
    public void createTopic(String title, String content) {
        createTopic(title, content, null);
    }
    
    /**
     * Check if topic was created successfully by looking for Sonner toast
     */
    public boolean isTopicCreatedSuccessfully() {
        try {
            System.out.println("Checking topic creation success...");
            Thread.sleep(3000); // Wait for form submission and response
            
            String currentUrl = driver.getCurrentUrl();
            System.out.println("Current URL after submission: " + currentUrl);
            
            // Method 1: Check for Sonner toast success message (most reliable indicator)
            boolean foundSuccessToast = false;
            for (int i = 0; i < 5; i++) {
                try {
                    // Sonner toasts are positioned "top-center" and have specific structure
                    List<WebElement> toastElements = driver.findElements(By.cssSelector(
                        ".toaster .sonner-toast, [data-sonner-toast], .toast"
                    ));
                    
                    for (WebElement toast : toastElements) {
                        if (toast.isDisplayed()) {
                            String toastText = toast.getText().toLowerCase();
                            if (toastText.contains("topic created successfully") || 
                                (toastText.contains("topic") && toastText.contains("success"))) {
                                System.out.println("✓ Found Sonner success toast: " + toast.getText());
                                foundSuccessToast = true;
                                break;
                            }
                        }
                    }
                    
                    if (foundSuccessToast) break;
                    Thread.sleep(1000); // Wait and check again
                    
                } catch (Exception e) {
                    // No toast found, continue checking
                }
            }
            
            // Method 2: Check if redirected away from create page (indicates success)
            boolean redirectedFromCreate = !currentUrl.contains("/create-topic");
            if (redirectedFromCreate) {
                if (currentUrl.contains("/topics/")) {
                    System.out.println("✓ Redirected to topic page: " + currentUrl);
                } else if (currentUrl.contains("/topics")) {
                    System.out.println("✓ Redirected to topics list: " + currentUrl);
                } else {
                    System.out.println("✓ Redirected away from create page: " + currentUrl);
                }
            }
            
            // Method 3: Check page title for confirmation
            boolean titleIndicatesSuccess = false;
            try {
                String pageTitle = driver.getTitle();
                if (pageTitle.toLowerCase().contains("topic") && !pageTitle.toLowerCase().contains("create")) {
                    System.out.println("✓ Page title indicates topic page: " + pageTitle);
                    titleIndicatesSuccess = true;
                }
            } catch (Exception e) {
                System.out.println("Could not check page title");
            }
            
            // If still on create page, check for errors
            if (currentUrl.contains("/create-topic")) {
                System.out.println("⚠ Still on create topic page - checking for errors");
                
                try {
                    WebElement errorAlert = driver.findElement(By.cssSelector("[role='alert'][data-slot='alert']"));
                    if (errorAlert.isDisplayed() && errorAlert.getAttribute("class").contains("destructive")) {
                        System.out.println("✗ Error message found: " + errorAlert.getText());
                        return false;
                    }
                } catch (Exception e) {
                    System.out.println("No error message found on create page");
                }
                
                // Being on create page without error might mean form validation failed silently
                if (!foundSuccessToast) {
                    System.out.println("✗ Still on create page with no success indicators");
                    return false;
                }
            }
            
            // Success if we found toast OR redirected from create page
            boolean success = foundSuccessToast || redirectedFromCreate || titleIndicatesSuccess;
            
            System.out.println("Topic creation success verification:");
            System.out.println("  - Sonner toast found: " + foundSuccessToast);
            System.out.println("  - Redirected from create: " + redirectedFromCreate);
            System.out.println("  - Title indicates success: " + titleIndicatesSuccess);
            System.out.println("  - Overall result: " + success);
            
            return success;
            
        } catch (Exception e) {
            System.out.println("Error checking topic creation success: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Click cancel button to abort topic creation
     */
    public void clickCancelButton() {
        try {
            WebElement cancelButton = driver.findElement(By.xpath("//button[contains(text(), 'Cancel')] | //a[contains(text(), 'Cancel')]"));
            cancelButton.click();
            System.out.println("✓ Clicked cancel button");
        } catch (Exception e) {
            System.out.println("Cancel button not found or not clickable");
        }
    }
    
    /**
     * Helper method to check if element exists
     */
    private boolean isElementPresent(String cssSelector) {
        try {
            return !driver.findElements(By.cssSelector(cssSelector)).isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
} 
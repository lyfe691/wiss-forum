package ch.wiss.forum.selenium;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.junit.jupiter.api.TestInfo;

import java.time.Duration;

/**
 * Base class for Selenium tests
 * Btw, The Selenium have been a huge pain due to the frontend
 * being built in Tailwind CSS and shadcn, making it hard to find
 * the correct selectors.
 * 
 * @author Yanis Sebastian Zürcher
 */
public abstract class BaseSeleniumTest {
    
    protected WebDriver driver;
    protected WebDriverWait wait;
    
    // frontend url
    protected static final String BASE_URL = "http://localhost:3000";
    
    @BeforeEach
    void setUp(TestInfo testInfo) {
        // setup chrome driver
        WebDriverManager.chromedriver().setup();
        ChromeOptions chromeOptions = new ChromeOptions();
        chromeOptions.addArguments("--no-sandbox");
        chromeOptions.addArguments("--disable-dev-shm-usage");
        chromeOptions.addArguments("--disable-gpu");
        chromeOptions.addArguments("--remote-allow-origins=*");
        driver = new ChromeDriver(chromeOptions);
        
        // configure timeouts
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        
        // set consistent window size
        driver.manage().window().setSize(new org.openqa.selenium.Dimension(1920, 1080));
        
        System.out.println("Starting test: " + testInfo.getDisplayName() + " with browser: CHROME");
    }
    
    @AfterEach
    void tearDown(TestInfo testInfo) {
        if (driver != null) {
            driver.quit();
            System.out.println("Finished test: " + testInfo.getDisplayName());
        }
    }
    
    /**
     * clear all browser data for clean test state
     */
    protected void clearBrowserData() {
        // navigate to app to ensure storage is available
        driver.get(BASE_URL);
        
        // clear everything
        driver.manage().deleteAllCookies();
        
        try {
            ((org.openqa.selenium.JavascriptExecutor) driver)
                .executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
        } catch (Exception e) {
            System.out.println("Could not clear storage: " + e.getMessage());
        }
    }
} 
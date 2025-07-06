package ch.wiss.forum.selenium.tests;

import ch.wiss.forum.selenium.BaseSeleniumTest;
import ch.wiss.forum.selenium.pages.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * validates admin access and visibility of the admin dashboard after promotion.
 * uses existing authentication flow and admin tool.
 * 
 * for m450 7A/8A: this test confirms that the new custom feature (enhanced admin dashboard) is functional.
 * 
 * @author Yanis Sebastian Zürcher
 */
@DisplayName("Admin Dashboard Access Test")
public class AdminAccessTest extends BaseSeleniumTest {

    private RegisterPage registerPage;
    private LoginPage loginPage;
    private AdminToolPage adminToolPage;

    private static final String WIRED_PASSWORD = "present_day";

    private String username;
    private String email;

    @BeforeEach
    public void setUp() {
        registerPage = new RegisterPage(driver, wait);
        loginPage = new LoginPage(driver, wait);
        adminToolPage = new AdminToolPage(driver, wait);

        clearBrowserData();

        long timestamp = System.currentTimeMillis();
        username = "lain" + timestamp;
        email = "lain." + timestamp + "@wiss-edu.ch";
    }

    @Test
    @DisplayName("✅ Promote to Admin and Access Dashboard")
    void testAdminPromotionAndDashboardAccess() throws InterruptedException {
        // === Step 1: Register user ===
        registerPage.navigateToRegisterPage();
        registerPage.register(username, email, WIRED_PASSWORD, "Lain Iwakura");
        Thread.sleep(2000);
        assertTrue(registerPage.isRegistrationSuccessful(), "User registration should succeed");

        // === Step 2: Login ===
        loginPage.navigateToLoginPage();
        loginPage.login(username, WIRED_PASSWORD);
        Thread.sleep(2000);
        assertTrue(loginPage.isLoginSuccessful(), "User login should succeed");

        // === Step 3: Promote to admin ===
        adminToolPage.navigateToAdminTool();
        boolean promoted = adminToolPage.promoteToAdmin();
        assertTrue(promoted, "Promotion to admin should succeed");

        // === Step 4: Re-login after promotion ===
        loginPage.navigateToLoginPage();
        loginPage.login(username, WIRED_PASSWORD);
        Thread.sleep(2000);
        assertTrue(loginPage.isLoginSuccessful(), "Re-login after promotion should succeed");

        // === Step 5: Navigate to admin dashboard ===
        driver.get(BASE_URL + "/admin");
        Thread.sleep(1000);

        // === Step 6: Validate dashboard visible ===
        boolean headingFound = driver.getPageSource().contains("Admin Dashboard");
        assertTrue(headingFound, "Admin Dashboard title should be visible");

        System.out.println("✓ Admin Dashboard rendered successfully for promoted user.");
        Thread.sleep(5000);
    }
}

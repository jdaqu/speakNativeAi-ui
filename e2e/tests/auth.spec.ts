import { test, expect } from '../fixtures/electron';

/**
 * Authentication E2E Tests
 *
 * Tests login, registration, and logout functionality.
 * Following Playwright best practices:
 * - Uses Page Object Model
 * - Semantic locators (getByRole, getByLabel)
 * - No hard-coded waits
 * - Test independence
 */

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ loginPage, dashboardPage }) => {
    await test.step('Navigate to login page', async () => {
      await loginPage.goto();
    });

    await test.step('Fill and submit login form', async () => {
      await loginPage.login('jdiegoquan@gmail.com', 'test1234');
    });

    await test.step('Verify redirect to dashboard', async () => {
      await loginPage.waitForUrl('/dashboard');
      expect(await dashboardPage.isOnDashboard()).toBe(true);
      expect(await dashboardPage.isDashboardLoaded()).toBe(true);
    });
  });

  test('should display error with invalid credentials', async ({ loginPage }) => {
    await test.step('Navigate to login page', async () => {
      await loginPage.goto();
    });

    await test.step('Submit invalid credentials', async () => {
      await loginPage.login('invalid@example.com', 'wrongpassword');
    });

    await test.step('Verify error message is displayed', async () => {
      await loginPage.errorMessage.waitFor({ state: 'attached', timeout: 10000 });
      await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });
      await expect(loginPage.errorMessage).toHaveText(/incorrect|invalid|wrong|error/i);
      expect(await loginPage.isLoginFormVisible()).toBe(true);
    });
  });

  test('should logout successfully', async ({ authenticatedPage, loginPage, dashboardPage }) => {
    await test.step('Verify user is logged in', async () => {
      expect(await dashboardPage.isOnDashboard()).toBe(true);
      expect(await dashboardPage.isDashboardLoaded()).toBe(true);
    });

    await test.step('Perform logout', async () => {
      expect(await dashboardPage.isLogoutButtonVisible()).toBe(true);
      await dashboardPage.logout();
    });

    await test.step('Verify redirect to login', async () => {
      await loginPage.waitForUrl('/login');
      expect(await loginPage.isLoginFormVisible()).toBe(true);
    });
  });
});

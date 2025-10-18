import { test, expect } from '../fixtures/electron';

/**
 * Navigation E2E Tests
 *
 * Tests app navigation and routing.
 * Following Playwright best practices.
 */

test.describe('App Navigation', () => {
  test('should show login page as main page when not authenticated', async ({ loginPage }) => {
    await test.step('Wait for page to load', async () => {
      await loginPage.waitForPageLoad();
    });

    await test.step('Verify login form elements are visible', async () => {
      await expect(loginPage.emailInput).toBeVisible({ timeout: 10000 });
      await expect(loginPage.passwordInput).toBeVisible({ timeout: 10000 });
      await expect(loginPage.submitButton).toBeVisible({ timeout: 10000 });
    });
  });
});

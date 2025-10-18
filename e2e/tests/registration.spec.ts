import { test, expect } from '../fixtures/electron';

/**
 * Registration E2E Tests
 *
 * Tests user registration functionality.
 * Following Playwright best practices with Page Object Model.
 */

test.describe('Registration', () => {
  test('should register a new user successfully', async ({ loginPage, registerPage, dashboardPage }) => {
    await test.step('Navigate to registration page', async () => {
      await loginPage.goto();
      await loginPage.goToRegister();
    });

    await test.step('Fill and submit registration form', async () => {
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@example.com`;
      const testUsername = `testuser${timestamp}`;
      await registerPage.register(testEmail, testUsername, 'Test1234!');
    });

    await test.step('Verify successful registration', async () => {
      // Should redirect to dashboard or login
      await registerPage.waitForPageLoad();
      const url = registerPage.getUrl();
      expect(url).toMatch(/\/(dashboard|login)/);
    });
  });

  test('should display error when registering with existing email', async ({ loginPage, registerPage }) => {
    await test.step('Navigate to registration page', async () => {
      await loginPage.goto();
      await loginPage.goToRegister();
    });

    await test.step('Attempt registration with existing email', async () => {
      await registerPage.register('jdiegoquan@gmail.com', 'existinguser', 'Test1234!');
    });

    await test.step('Verify error message is displayed', async () => {
      // Check that the error element exists and is visible
      await expect(registerPage.errorMessage).toBeVisible();
      
      // Verify the error element contains some text (not empty)
      await expect(registerPage.errorMessage).not.toBeEmpty();
    });
  });

});

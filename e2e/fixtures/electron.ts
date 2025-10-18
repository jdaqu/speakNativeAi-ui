import { test as base } from '@playwright/test';
import { ElectronAppHelper } from '../helpers/electron-app';
import { ElectronApplication, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * Custom fixtures for Electron testing.
 *
 * Provides convenient access to the Electron app, windows, and Page Objects.
 * Following Playwright best practices with proper fixture management.
 */

type ElectronFixtures = {
  electronApp: ElectronApplication;
  mainWindow: Page;
  appHelper: ElectronAppHelper;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<ElectronFixtures>({
  // App helper fixture - provides utility methods and auto-launches the app
  appHelper: async ({}, use) => {
    const helper = new ElectronAppHelper();
    await helper.launch();
    await use(helper);

    // Close with a timeout to prevent hanging
    const closePromise = helper.close();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('App close timeout')), 5000)
    );

    try {
      await Promise.race([closePromise, timeoutPromise]);
    } catch (error) {
      console.error('Error closing app:', error);
    }
  },

  // Electron app fixture
  electronApp: async ({ appHelper }, use) => {
    const app = appHelper.getApp();
    await use(app);
  },

  // Main window fixture
  mainWindow: async ({ appHelper }, use) => {
    const window = await appHelper.getMainWindow();
    await use(window);
  },

  // Page Object fixtures
  loginPage: async ({ mainWindow }, use) => {
    const loginPage = new LoginPage(mainWindow);
    await use(loginPage);
  },

  registerPage: async ({ mainWindow }, use) => {
    const registerPage = new RegisterPage(mainWindow);
    await use(registerPage);
  },

  dashboardPage: async ({ mainWindow }, use) => {
    const dashboardPage = new DashboardPage(mainWindow);
    await use(dashboardPage);
  },

  // Authenticated page fixture - auto-logs in before test
  authenticatedPage: async ({ mainWindow, loginPage }, use) => {
    console.log('[Fixture] Starting login...');
    await loginPage.goto();
    console.log('[Fixture] On login page, URL:', mainWindow.url());

    await loginPage.login('jdiegoquan@gmail.com', 'test1234');
    console.log('[Fixture] Login submitted, waiting for dashboard...');

    await loginPage.waitForUrl('/dashboard');
    console.log('[Fixture] Navigated to:', mainWindow.url());

    // Take a screenshot after login
    await mainWindow.screenshot({ path: 'e2e/screenshots/after-login-fixture.png', fullPage: true });

    await use(mainWindow);
  },
});

export { expect } from '@playwright/test';

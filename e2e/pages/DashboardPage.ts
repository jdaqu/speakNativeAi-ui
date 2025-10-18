import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * DashboardPage - Page Object for the Dashboard page
 *
 * Encapsulates all interactions with the main dashboard.
 */
export class DashboardPage extends BasePage {
  // Locators
  readonly logoutButton: Locator;
  readonly pageBody: Locator;
  readonly dashboardHeading: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators - use semantic selectors
    this.logoutButton = page.getByRole('button', { name: /logout|sign out|log out/i });
    this.pageBody = page.locator('body');
    // Look for a heading or main element that confirms we're on dashboard
    this.dashboardHeading = page.getByRole('heading', { name: /dashboard|home|welcome/i }).first();
  }

  /**
   * Navigate to the dashboard
   */
  async goto(): Promise<void> {
    const devServerPort = process.env.DEV_SERVER_PORT || '3000';
    const baseUrl = `http://localhost:${devServerPort}`;
    await this.page.goto(`${baseUrl}/dashboard`, { waitUntil: 'load' });
    await this.waitForPageLoad();
  }

  /**
   * Check if we're on the dashboard
   * Uses both URL check and page content to verify
   * Handles both /dashboard and /dashboard/index.html (for Electron static builds)
   */
  async isOnDashboard(): Promise<boolean> {
    const currentUrl = this.page.url();
    const urlCheck = currentUrl.includes('/dashboard');
    // Also verify we're not on a 404 or error page
    const notOnErrorPage = await this.page.locator('text=/404|not found/i').count() === 0;
    return urlCheck && notOnErrorPage;
  }

  /**
   * Perform logout
   */
  async logout(): Promise<void> {
    const logoutCount = await this.logoutButton.count();

    if (logoutCount > 0) {
      await this.logoutButton.first().click();
      await this.waitForUrl('/login|/$');
    }
  }

  /**
   * Check if logout button is visible
   */
  async isLogoutButtonVisible(): Promise<boolean> {
    try {
      await this.logoutButton.first().waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if page is loaded (no login form visible)
   */
  async isDashboardLoaded(): Promise<boolean> {
    // Check that we're not on login page
    const emailInput = this.page.getByLabel(/email/i);
    const emailCount = await emailInput.count();

    // Check we're not on an error page
    const notOnErrorPage = await this.page.locator('text=/404|not found/i').count() === 0;

    return emailCount === 0 && await this.pageBody.isVisible() && notOnErrorPage;
  }

  /**
   * Get the underlying page object (for debugging)
   */
  getPage(): Page {
    return this.page;
  }
}

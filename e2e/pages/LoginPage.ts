import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage - Page Object for the Login page
 *
 * Encapsulates all interactions with the login page.
 */
export class LoginPage extends BasePage {
  // Locators - using semantic selectors
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly showPasswordButton: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators using semantic selectors (best practice)
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /sign in|login/i });
    // Use a more specific selector that combines role and testid to avoid Next.js route announcer
    this.errorMessage = page.locator('[role="alert"][data-testid="login-error"]');
    this.registerLink = page.getByRole('link', { name: /sign up|register/i });
    this.showPasswordButton = page.getByRole('button').filter({ has: page.locator('svg') }).nth(0);
  }

  /**
   * Navigate to the login page
   */
  async goto(): Promise<void> {
    // Get base URL from config or current page URL
    const devServerPort = process.env.DEV_SERVER_PORT || '3000';
    const baseUrl = `http://localhost:${devServerPort}`;

    await this.page.goto(`${baseUrl}/login`, { waitUntil: 'load' });
    await this.emailInput.waitFor({ state: 'visible', timeout: 10_000 });

    // await this.waitForPageLoad();

    // // If not on login page, look for login form or navigate
    // if (!this.urlContains('/login')) {
    //   // Check if login form is already visible (app might show it at root)
    //   const emailVisible = await this.emailInput.isVisible().catch(() => false);

    //   if (!emailVisible) {
    //     // Try to find and click login link
    //     const loginLink = this.page.getByRole('link', { name: /login|sign in/i });
    //     const count = await loginLink.count();

    //     if (count > 0) {
    //       await loginLink.first().click();
    //       await this.waitForPageLoad();
    //     }
    //   }
    // }
  }

  /**
   * Perform login with credentials
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    const [resp] = await Promise.all([
      this.page.waitForRequest(r =>
        r.url().includes('/auth/login') && r.method() === 'POST'
      ),
      this.submitButton.click()
    ]);

    return resp;
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    const text = await this.errorMessage.textContent();
    return text?.trim() || '';
  }

  /**
   * Check if error message is visible
   */
  async isErrorVisible(): Promise<boolean> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
      const text = await this.errorMessage.textContent();
      return text !== null && text.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Click on register link
   */
  async goToRegister(): Promise<void> {
    await this.registerLink.click();
    await this.waitForUrl('/register');
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(): Promise<void> {
    await this.showPasswordButton.click();
  }

  /**
   * Check if login form is visible
   */
  async isLoginFormVisible(): Promise<boolean> {
    return await this.emailInput.isVisible() &&
           await this.passwordInput.isVisible() &&
           await this.submitButton.isVisible();
  }

  /**
   * Get the underlying page object (for debugging)
   */
  getPage(): Page {
    return this.page;
  }
}

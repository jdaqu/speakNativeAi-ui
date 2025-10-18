import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * RegisterPage - Page Object for the Registration page
 *
 * Encapsulates all interactions with the registration page.
 */
export class RegisterPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators using semantic selectors
    this.emailInput = page.getByLabel(/email/i);
    this.usernameInput = page.getByLabel(/username/i);
    this.passwordInput = page.getByLabel(/^password/i).first();
    this.confirmPasswordInput = page.getByLabel(/confirm|repeat/i);
    this.submitButton = page.getByRole('button', { name: /create account/i });
    this.errorMessage = page.getByTestId('registration-error');
    this.loginLink = page.getByRole('link', { name: /login|sign in/i });
  }

  /**
   * Navigate to the registration page
   */
  async goto(): Promise<void> {
    await this.waitForPageLoad();

    if (!this.urlContains('/register')) {
      const registerLink = this.page.getByRole('link', { name: /sign up|register/i });
      const count = await registerLink.count();

      if (count > 0) {
        await registerLink.first().click();
        await this.waitForPageLoad();
      }
    }
  }

  /**
   * Fill registration form
   */
  async register(email: string, username: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);

    // Check if confirm password field exists
    const confirmPasswordExists = await this.confirmPasswordInput.count() > 0;
    if (confirmPasswordExists) {
      await this.confirmPasswordInput.fill(password);
    }

    await this.submitButton.click();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 10000 });
    const text = await this.errorMessage.textContent();
    return text?.trim() || '';
  }

  /**
   * Check if error message is visible
   */
  async isErrorVisible(): Promise<boolean> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click on login link
   */
  async goToLogin(): Promise<void> {
    await this.loginLink.click();
    await this.waitForUrl('/login');
  }

  /**
   * Check if registration form is visible
   */
  async isRegisterFormVisible(): Promise<boolean> {
    return await this.emailInput.isVisible() &&
           await this.usernameInput.isVisible() &&
           await this.passwordInput.isVisible() &&
           await this.submitButton.isVisible();
  }
}

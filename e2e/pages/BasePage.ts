import { Page, Locator, Response } from '@playwright/test';
import { ElectronApplication } from '@playwright/test';

/**
 * BasePage - Parent class for all Page Objects
 *
 * Contains common methods and utilities that all pages inherit.
 * All page objects MUST extend this class.
 */
export class BasePage {
  protected page: Page;
  protected electronApp?: ElectronApplication;

  constructor(page: Page, electronApp?: ElectronApplication) {
    this.page = page;
    this.electronApp = electronApp;
  }

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');

    // Wait for Next.js hydration (with timeout protection)
    try {
      await this.page.locator('#__next').waitFor({ state: 'attached', timeout: 5000 });
    } catch {
      // If #__next doesn't exist, just ensure body is visible
      await this.page.locator('body').waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  /**
   * Navigate to a specific URL
   */
  async navigate(path: string): Promise<void> {
    // Use dev server URL for Electron tests
    const devServerPort = process.env.DEV_SERVER_PORT || '3000';
    const baseUrl = `http://localhost:${devServerPort}`;
    await this.page.goto(`${baseUrl}${path}`);
    await this.waitForPageLoad();
  }

  /**
   * Get current URL
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Check if URL contains a specific path
   */
  urlContains(path: string): boolean {
    return this.page.url().includes(path);
  }

  /**
   * Wait for URL to contain a specific path
   */
  async waitForUrl(path: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForURL(new RegExp(path), { timeout });
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `e2e/screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    });
  }

  /**
   * Wait for an element to be visible
   */
  async waitForElement(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * Reload the current page
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  async waitForResponse(predicate: (resp: Response) => boolean, options?: { timeout?: number }) {
    return await this.page.waitForResponse(predicate, options);
  }
}

import { test, expect } from '../fixtures/electron';

/**
 * Application Launch E2E Tests
 *
 * Tests basic app launch and window creation.
 * Following Playwright best practices.
 */

test.describe('Application Launch', () => {
  test('should launch the app successfully', async ({ electronApp }) => {
    await test.step('Verify Electron app is ready', async () => {
      const isReady = await electronApp.evaluate(async ({ app }) => {
        return app.isReady();
      });

      expect(isReady).toBe(true);
    });
  });

  test('should create a main window', async ({ mainWindow }) => {
    await test.step('Verify main window exists', async () => {
      expect(mainWindow).toBeDefined();
    });

    await test.step('Wait for page to load', async () => {
      await mainWindow.waitForLoadState('domcontentloaded');
    });

    await test.step('Verify body is visible', async () => {
      const body = mainWindow.locator('body');
      await expect(body).toBeVisible({ timeout: 10000 });
    });
  });
});

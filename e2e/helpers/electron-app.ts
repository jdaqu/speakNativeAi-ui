import { _electron as electron, ElectronApplication, Page } from '@playwright/test';
import * as path from 'path';

/**
 * Helper class to manage Electron application lifecycle in tests.
 *
 * This class handles launching and closing the Electron app, and provides
 * convenient methods to access windows and pages.
 */
export class ElectronAppHelper {
  private app: ElectronApplication | null = null;

  /**
   * Launches the Electron application.
   *
   * @returns The ElectronApplication instance
   */
  async launch(): Promise<ElectronApplication> {
    // Path to the Electron main file
    const appPath = path.join(__dirname, '../../electron/main.js');

    // Determine the dev server port
    const devServerPort = process.env.DEV_SERVER_PORT || '3000';

    // Get the path to the electron executable
    const electronPath = require('electron');

    console.log('[ElectronAppHelper] Launching Electron...');
    console.log('[ElectronAppHelper] Electron path:', electronPath);
    console.log('[ElectronAppHelper] App path:', appPath);
    console.log('[ElectronAppHelper] Dev server port:', devServerPort);

    // Launch Electron app with error handling
    try {
      this.app = await electron.launch({
        executablePath: electronPath,
        args: [appPath],
        env: {
          ...process.env,
          NODE_ENV: 'test',
          DEV_SERVER_PORT: devServerPort,
        },
        timeout: 60000,
      });

      console.log('[ElectronAppHelper] Electron launched successfully');

      // Wait for the app to be ready
      await this.app.evaluate(async ({ app }) => {
        return app.isReady();
      });

      console.log('[ElectronAppHelper] App is ready');

      return this.app;
    } catch (error) {
      console.error('[ElectronAppHelper] Failed to launch Electron:');
      console.error('[ElectronAppHelper] Error:', error);
      throw error;
    }
  }

  /**
   * Gets the main window (first window) of the application.
   *
   * @returns The main window Page
   */
  async getMainWindow(): Promise<Page> {
    if (!this.app) {
      throw new Error('App not launched. Call launch() first.');
    }

    // Wait for the first window to appear
    const window = await this.app.firstWindow();

    // Wait for the page to load
    await window.waitForLoadState('domcontentloaded');

    return window;
  }

  /**
   * Gets all windows of the application.
   *
   * @returns Array of all window Pages
   */
  async getAllWindows(): Promise<Page[]> {
    if (!this.app) {
      throw new Error('App not launched. Call launch() first.');
    }

    return this.app.windows();
  }

  /**
   * Waits for a new window to be created.
   * Useful when testing features that open new windows (like quick access popup).
   *
   * @param timeout Timeout in milliseconds (default: 5000)
   * @returns The new window Page
   */
  async waitForNewWindow(timeout: number = 5000): Promise<Page> {
    if (!this.app) {
      throw new Error('App not launched. Call launch() first.');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout waiting for new window'));
      }, timeout);

      this.app!.on('window', (window) => {
        clearTimeout(timeoutId);
        window.waitForLoadState('domcontentloaded').then(() => resolve(window));
      });
    });
  }

  /**
   * Simulates pressing a global keyboard shortcut.
   *
   * @param shortcut The shortcut to press (e.g., 'CommandOrControl+Shift+S')
   */
  async pressGlobalShortcut(shortcut: string): Promise<void> {
    if (!this.app) {
      throw new Error('App not launched. Call launch() first.');
    }

    // Get the main window to send keyboard events
    const window = await this.getMainWindow();

    // Parse the shortcut and press keys
    const keys = shortcut.split('+');
    const modifiers: string[] = [];
    let key = '';

    for (const k of keys) {
      if (k === 'CommandOrControl') {
        modifiers.push(process.platform === 'darwin' ? 'Meta' : 'Control');
      } else if (k === 'Command' || k === 'Meta') {
        modifiers.push('Meta');
      } else if (k === 'Control') {
        modifiers.push('Control');
      } else if (k === 'Alt') {
        modifiers.push('Alt');
      } else if (k === 'Shift') {
        modifiers.push('Shift');
      } else {
        key = k;
      }
    }

    // Press modifiers
    for (const mod of modifiers) {
      await window.keyboard.down(mod);
    }

    // Press the key
    await window.keyboard.press(key);

    // Release modifiers
    for (const mod of modifiers.reverse()) {
      await window.keyboard.up(mod);
    }

    // Wait a bit for the app to process the shortcut
    await window.waitForTimeout(500);
  }

  /**
   * Closes the Electron application.
   */
  async close(): Promise<void> {
    if (this.app) {
      try {
        // Close all windows first
        const windows = await this.app.windows();
        await Promise.all(windows.map(window => window.close().catch(() => {})));

        // Then close the app
        await this.app.close();
      } catch (error) {
        // If close fails, try to force quit
        console.warn('Failed to close app gracefully, attempting force quit:', error);
        try {
          await this.app.process().kill();
        } catch (killError) {
          console.error('Failed to kill app process:', killError);
        }
      } finally {
        this.app = null;
      }
    }
  }

  /**
   * Gets the Electron app instance directly (for advanced usage).
   *
   * @returns The ElectronApplication instance
   */
  getApp(): ElectronApplication {
    if (!this.app) {
      throw new Error('App not launched. Call launch() first.');
    }
    return this.app;
  }
}

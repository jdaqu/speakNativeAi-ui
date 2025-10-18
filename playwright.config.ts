import { defineConfig } from '@playwright/test';

/**
 * Playwright configuration for E2E testing of the Electron desktop app.
 *
 * This config is designed to test the Electron application, not the web version.
 * Tests will launch the Electron app using the built artifacts.
 */
export default defineConfig({
  testDir: './e2e/tests',

  // Timeout for each test (60s for Electron app launch/teardown)
  timeout: 60 * 1000,

  // Timeout for assertions
  expect: {
    timeout: 10000
  },

  // Run tests in files in parallel
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  use: {
    // Base URL for web server (not used for Electron, but kept for compatibility)
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for Electron testing
  projects: [
    {
      name: 'electron',
      testMatch: /.*\.spec\.ts/,
      use: {
        // Electron-specific settings will be configured in test helpers
      },
    },
  ],

  // Start Next.js dev server for Electron tests
  // The Electron app will connect to this server
  webServer: {
    command: 'cross-env PORT=3000 npm run dev',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});

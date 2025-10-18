# E2E Testing Guide for SpeakNative AI Desktop App

This guide explains how to write and run end-to-end (E2E) tests for the SpeakNative AI Electron desktop application using Playwright.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Writing Tests](#writing-tests)
- [Test Helpers and Fixtures](#test-helpers-and-fixtures)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The E2E test suite uses **Playwright** to test the Electron desktop application. Tests run against the actual Electron app, simulating real user interactions.

### What's Included

- **Test Framework**: Playwright with TypeScript
- **Test Helpers**: Custom Electron app launcher and window management
- **Test Fixtures**: Reusable fixtures for app and window access
- **Example Tests**: App launch, navigation, and quick access popup tests

## Setup

### Prerequisites

- Node.js (v16 or higher)
- The SpeakNative AI desktop app project

### Installation

All dependencies are already installed if you ran `npm install` in the project root. The key testing dependencies are:

```json
{
  "@playwright/test": "^1.56.0",
  "playwright": "^1.56.0"
}
```

## Running Tests

### Available Test Scripts

```bash
# Run all tests (headless mode)
npm run test:e2e

# Run tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run tests in headed mode (see browser window)
npm run test:e2e:headed

# Run tests in debug mode with Playwright Inspector
npm run test:e2e:debug

# Show test report from last run
npm run test:e2e:report
```

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test e2e/app-launch.spec.ts

# Run tests matching a pattern
npx playwright test quick-access

# Run a specific test by name
npx playwright test -g "should launch the app successfully"
```

### Development Workflow

**IMPORTANT**: You must have the Next.js dev server running before running E2E tests.

1. **Start the Next.js dev server**:
   ```bash
   npm run dev
   ```
   Keep this running in a separate terminal.

2. **Start your backend server** (if required):
   ```bash
   # In the backend directory
   python -m uvicorn app.main:app --reload
   ```

3. **Run tests in UI mode** for best development experience:
   ```bash
   npm run test:e2e:ui
   ```

4. **Debug failing tests**:
   ```bash
   npm run test:e2e:debug
   ```

## Project Structure

```
speakNativeAi-ui/
├── e2e/                              # E2E test directory
│   ├── helpers/
│   │   └── electron-app.ts           # Electron app lifecycle helper
│   ├── fixtures/
│   │   └── electron.ts               # Custom Playwright fixtures
│   ├── app-launch.spec.ts            # App launch tests
│   ├── quick-access.spec.ts          # Quick access popup tests
│   ├── navigation.spec.ts            # Navigation tests
│   └── .gitignore                    # Ignore test artifacts
├── playwright.config.ts              # Playwright configuration
├── playwright-report/                # Test reports (generated)
└── test-results/                     # Test artifacts (generated)
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from './fixtures/electron';

test.describe('Feature Name', () => {
  test('should do something', async ({ mainWindow }) => {
    // Your test code here
    await expect(mainWindow.locator('selector')).toBeVisible();
  });
});
```

### Using Fixtures

The custom fixtures provide easy access to the Electron app and windows:

```typescript
test('example test', async ({ electronApp, mainWindow, appHelper }) => {
  // electronApp: ElectronApplication instance
  // mainWindow: Main window Page
  // appHelper: Helper with utility methods
});
```

### Common Test Patterns

#### 1. Testing the Main Window

```typescript
test('should display login page', async ({ mainWindow }) => {
  await mainWindow.waitForLoadState('domcontentloaded');

  const loginButton = mainWindow.locator('button:has-text("Login")');
  await expect(loginButton).toBeVisible();
});
```

#### 2. Testing Quick Access Popup

```typescript
test('should open quick access', async ({ appHelper }) => {
  // Press global shortcut
  const shortcut = process.platform === 'darwin'
    ? 'Command+Shift+S'
    : 'Control+Shift+S';
  await appHelper.pressGlobalShortcut(shortcut);

  // Wait for popup window
  const popup = await appHelper.waitForNewWindow();

  // Test popup content
  await expect(popup.locator('button:has-text("Fix")')).toBeVisible();
});
```

#### 3. Testing Navigation

```typescript
test('should navigate to settings', async ({ mainWindow }) => {
  const settingsLink = mainWindow.locator('a[href="/settings"]');
  await settingsLink.click();

  await mainWindow.waitForURL(/settings/);
  expect(mainWindow.url()).toContain('settings');
});
```

#### 4. Testing User Input

```typescript
test('should accept text input', async ({ mainWindow }) => {
  const input = mainWindow.locator('textarea#message');
  await input.fill('Test message');

  const value = await input.inputValue();
  expect(value).toBe('Test message');
});
```

## Test Helpers and Fixtures

### ElectronAppHelper

Located at `e2e/helpers/electron-app.ts`, this class provides methods for managing the Electron app:

```typescript
class ElectronAppHelper {
  // Launch the app
  async launch(): Promise<ElectronApplication>

  // Get the main window
  async getMainWindow(): Promise<Page>

  // Get all windows
  async getAllWindows(): Promise<Page[]>

  // Wait for a new window to appear
  async waitForNewWindow(timeout?: number): Promise<Page>

  // Simulate global keyboard shortcut
  async pressGlobalShortcut(shortcut: string): Promise<void>

  // Close the app
  async close(): Promise<void>
}
```

### Custom Fixtures

Located at `e2e/fixtures/electron.ts`, these fixtures automatically manage app lifecycle:

```typescript
// Available fixtures:
test('example', async ({
  electronApp,  // ElectronApplication instance
  mainWindow,   // Main window Page
  appHelper     // ElectronAppHelper instance
}) => {
  // Test code
});
```

## Best Practices

### 1. Use Custom Fixtures

Always use the custom fixtures instead of manually launching the app:

```typescript
// Good
test('test name', async ({ mainWindow }) => {
  await expect(mainWindow.locator('body')).toBeVisible();
});

// Bad - don't manually launch
test('test name', async () => {
  const app = await electron.launch({ args: ['...'] });
  // ...
});
```

### 2. Wait for Elements

Always wait for elements before interacting:

```typescript
// Good
const button = mainWindow.locator('button');
await button.waitFor({ state: 'visible' });
await button.click();

// Also good - using Playwright's auto-waiting
await expect(mainWindow.locator('button')).toBeVisible();
```

### 3. Use Semantic Selectors

Prefer semantic selectors over implementation details:

```typescript
// Good
mainWindow.locator('button[aria-label="Submit"]')
mainWindow.locator('text="Login"')

// Less ideal
mainWindow.locator('.btn-primary-xyz-123')
```

### 4. Handle Timing Issues

Use proper waits instead of arbitrary timeouts:

```typescript
// Good
await mainWindow.waitForLoadState('domcontentloaded');
await mainWindow.waitForSelector('text="Welcome"');

// Avoid
await mainWindow.waitForTimeout(3000);  // Only use when necessary
```

### 5. Test in Isolation

Each test should be independent:

```typescript
// Good - test is self-contained
test('should login', async ({ mainWindow }) => {
  await mainWindow.locator('#username').fill('user');
  await mainWindow.locator('#password').fill('pass');
  await mainWindow.locator('button[type="submit"]').click();

  await expect(mainWindow.locator('text="Welcome"')).toBeVisible();
});

// Bad - depends on previous test state
```

### 6. Use Descriptive Test Names

```typescript
// Good
test('should display error message when login fails with invalid credentials')

// Less clear
test('login error')
```

## Troubleshooting

### App Doesn't Launch

**Problem**: Tests fail with "App not launched" error.

**Solution**:
- Check that Electron is installed: `npm ls electron`
- Verify the path to `electron/main.js` is correct
- Ensure no other instances of the app are running

### Global Shortcut Not Working

**Problem**: Quick access popup doesn't open with keyboard shortcut.

**Solution**:
- Check if another app is using the same shortcut
- On macOS, grant Accessibility permissions:
  - System Settings > Privacy & Security > Accessibility
  - Add your terminal or IDE to the list

### Tests Are Flaky

**Problem**: Tests pass sometimes but fail randomly.

**Solution**:
- Add proper waits: `waitForLoadState`, `waitForSelector`
- Avoid `waitForTimeout` unless absolutely necessary
- Increase timeout for slow operations:
  ```typescript
  await expect(element).toBeVisible({ timeout: 10000 });
  ```

### Screenshots and Videos

When tests fail, Playwright automatically captures:
- Screenshots (in `test-results/`)
- Videos (if configured)
- Traces (for debugging)

View them with:
```bash
npm run test:e2e:report
```

### Debug Mode

Run tests in debug mode to step through them:

```bash
npm run test:e2e:debug
```

This opens the Playwright Inspector where you can:
- Step through test actions
- Inspect the DOM
- View console logs
- Examine network requests

## Common Issues

### Issue: "Timeout waiting for new window"

This usually means the global shortcut didn't trigger or the popup window took too long to open.

**Fix**:
```typescript
// Increase timeout
const popup = await appHelper.waitForNewWindow(10000);  // 10 seconds
```

### Issue: "Element not found"

The selector doesn't match any elements.

**Fix**:
```typescript
// Use Playwright Inspector to find correct selector
npx playwright test --debug

// Or use more flexible selectors
await mainWindow.locator('button').filter({ hasText: 'Login' }).click();
```

### Issue: Tests pass locally but fail in CI

**Possible causes**:
- Different screen sizes
- Different timing (CI is usually slower)
- Missing environment variables

**Fix**:
- Set viewport size explicitly
- Increase timeouts in CI
- Check environment variables

## Next Steps

- Add more test cases for your specific features
- Integrate tests into CI/CD pipeline
- Set up visual regression testing (optional)
- Add code coverage reporting (optional)

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Electron Testing](https://playwright.dev/docs/api/class-electron)
- [Best Practices](https://playwright.dev/docs/best-practices)

# E2E Tests

End-to-end tests for the SpeakNative AI Electron desktop application.

## Quick Start

**IMPORTANT**: Start the Next.js dev server before running tests:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests
npm run test:e2e

# Or run with UI (recommended for development)
npm run test:e2e:ui

# Or run in debug mode
npm run test:e2e:debug
```

## Test Files

- **app-launch.spec.ts** - Tests basic app launch and window creation
- **quick-access.spec.ts** - Tests the quick access popup feature (Cmd/Ctrl+Shift+S)
- **navigation.spec.ts** - Tests navigation and routing within the app

## Documentation

See the full [E2E Testing Guide](../E2E_TESTING_GUIDE.md) for detailed information on:
- Writing new tests
- Using test helpers and fixtures
- Best practices
- Troubleshooting

## Directory Structure

```
e2e/
├── helpers/
│   └── electron-app.ts       # Electron app lifecycle helper
├── fixtures/
│   └── electron.ts           # Custom Playwright fixtures
├── *.spec.ts                 # Test files
└── README.md                 # This file
```

## Writing a New Test

```typescript
import { test, expect } from './fixtures/electron';

test.describe('My Feature', () => {
  test('should do something', async ({ mainWindow }) => {
    // Your test code
    await expect(mainWindow.locator('selector')).toBeVisible();
  });
});
```

## Available Fixtures

- `electronApp` - The Electron application instance
- `mainWindow` - The main window Page
- `appHelper` - Helper class with utility methods

## Useful Commands

```bash
# Run specific test file
npx playwright test e2e/app-launch.spec.ts

# Run tests matching pattern
npx playwright test quick-access

# Run specific test by name
npx playwright test -g "should launch"

# View last test report
npm run test:e2e:report
```

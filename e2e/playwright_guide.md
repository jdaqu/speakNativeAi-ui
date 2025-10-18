# Playwright E2E Testing Standards & Best Practices

## Project Context
This is a Playwright E2E testing project. All code must follow these standards for scalability, maintainability, and clean architecture.

---

## Project Structure (MANDATORY)

```
tests/
├── e2e/                    # End-to-end test files
│   ├── auth/              # Authentication flows
│   ├── checkout/          # Checkout processes
│   └── ...
├── api/                   # API test files (if applicable)
├── pages/                 # Page Object Models (POM)
│   ├── BasePage.js       # Base page with common methods
│   ├── LoginPage.js
│   └── ...
├── components/            # Reusable component objects
│   ├── Header.js
│   ├── Modal.js
│   └── ...
├── fixtures/              # Custom fixtures and test data
│   ├── testData.js
│   └── customFixtures.js
├── utils/                 # Helper functions
│   ├── apiHelpers.js
│   ├── dataGenerators.js
│   └── ...
└── config/               # Environment-specific configs
    ├── dev.config.js
    └── staging.config.js

playwright.config.js      # Main Playwright configuration
.env.example             # Environment variables template
```

---

## Core Principles (FOLLOW STRICTLY)

### 1. Locator Strategy Priority (ALWAYS USE IN THIS ORDER)

```javascript
// 1. PREFERRED: Role-based (accessible and semantic)
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('heading', { name: 'Welcome' })

// 2. GOOD: Label-based (form elements)
page.getByLabel('Email address')
page.getByLabel('Password')

// 3. ACCEPTABLE: Text-based (for unique text)
page.getByText('Welcome back')
page.getByText('Logout', { exact: true })

// 4. ACCEPTABLE: Placeholder (when no label exists)
page.getByPlaceholder('Enter your email')

// 5. LAST RESORT: Test IDs (better than CSS/XPath)
page.getByTestId('submit-button')

// 6. AVOID: CSS/XPath selectors (brittle and not semantic)
// Only use if absolutely necessary
page.locator('[data-cy="submit"]')
page.locator('xpath=//button[@class="submit"]')
```

### 2. Page Object Model (MANDATORY PATTERN)

**BasePage.js** (All pages must extend this)
```javascript
export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path) {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}
```

**Example Page Object**
```javascript
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Define locators as properties
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByRole('alert');
  }

  // Actions as methods
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  // Navigation specific to this page
  async goto() {
    await this.navigate('/login');
  }
}
```

### 3. Test Structure (ALWAYS FOLLOW THIS PATTERN)

```javascript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('User Authentication', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  test('should login with valid credentials', async ({ page }) => {
    await test.step('Fill login form', async () => {
      await loginPage.login('user@test.com', 'password123');
    });

    await test.step('Verify redirect to dashboard', async () => {
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(dashboardPage.welcomeMessage).toBeVisible();
    });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await loginPage.login('invalid@test.com', 'wrong');
    await expect(loginPage.errorMessage).toContainText('Invalid credentials');
  });
});
```

---

## Absolute DOs ✅

### Code Quality
- **USE descriptive test names** that explain what is being tested
- **USE test.step()** for complex tests to improve readability
- **USE Page Object Model** for ALL pages and components
- **USE async/await** for ALL Playwright operations
- **USE built-in assertions** (`expect(locator).toBeVisible()`)
- **USE beforeEach** for common setup (navigation, authentication)
- **USE test.describe** to group related tests logically

### Locators
- **USE getByRole, getByLabel, getByText** as first choice
- **USE data-testid** only when semantic selectors are not possible
- **USE strict mode locators** (they fail if multiple elements match)
- **STORE locators as class properties** in Page Objects

### Waits & Timing
- **RELY ON auto-waiting** - Playwright waits automatically
- **USE waitForResponse** for API calls
- **USE waitForSelector** only when absolutely needed
- **USE expect assertions** - they include smart waiting

### Test Independence
- **MAKE each test independent** - no shared state
- **USE fixtures** for test data and setup
- **CLEAN UP after tests** when necessary (delete created data)
- **ISOLATE tests** - use separate browser contexts

### Error Handling
- **ADD screenshots on failure** (configure in playwright.config.js)
- **USE trace files** for debugging (`trace: 'on-first-retry'`)
- **HANDLE expected errors** explicitly in tests
- **LOG meaningful messages** in test.step()

### Authentication
- **REUSE authentication state** across tests
```javascript
// In global setup
await context.storageState({ path: 'auth.json' });

// In playwright.config.js
use: {
  storageState: 'auth.json'
}
```

---

## Absolute DON'Ts ❌

### Anti-Patterns
- **NEVER use page.waitForTimeout()** - use smart waits or assertions
- **NEVER use sleep/delays** - Playwright handles timing
- **NEVER use arbitrary waits** - use event-based waiting
- **NEVER hardcode waits** like `await page.waitForTimeout(5000)`

### Locators
- **NEVER rely on CSS classes for locators** (they change frequently)
- **NEVER use complex XPath** unless absolutely no alternative
- **NEVER use indexes** like `page.locator('button').nth(2)` (brittle)
- **NEVER use parent/child traversal** excessively

### Test Structure
- **NEVER make tests depend on each other** (test order must not matter)
- **NEVER share state between tests** via global variables
- **NEVER test implementation details** - test user behavior
- **NEVER put business logic in tests** - keep it in Page Objects
- **NEVER duplicate code** - extract to Page Objects or utilities

### Code Quality
- **NEVER ignore linting warnings** - fix them
- **NEVER commit commented-out code**
- **NEVER use console.log for debugging** - use Playwright's debug tools
- **NEVER catch errors silently** - let tests fail explicitly

### Data Management
- **NEVER hardcode test data** in test files
- **NEVER use production data** in tests
- **NEVER commit sensitive data** (passwords, tokens)

---

## Configuration Best Practices

### playwright.config.js (TEMPLATE)
```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

---

## Common Patterns (USE THESE)

### Handling Dynamic Content
```javascript
// Wait for API response
await page.waitForResponse(
  response => response.url().includes('/api/users') && response.status() === 200
);

// Wait for element to be in specific state
await expect(page.getByText('Loading...')).toBeHidden();
await expect(page.getByText('Data loaded')).toBeVisible();
```

### Working with Multiple Elements
```javascript
// Count elements
const rows = page.getByRole('row');
await expect(rows).toHaveCount(10);

// Iterate elements
const items = await page.getByRole('listitem').all();
for (const item of items) {
  await expect(item).toBeVisible();
}

// Filter elements
const activeItems = page.getByRole('listitem').filter({ hasText: 'Active' });
await expect(activeItems).toHaveCount(5);
```

### Form Handling
```javascript
// Fill form
await page.getByLabel('First Name').fill('John');
await page.getByLabel('Last Name').fill('Doe');
await page.getByLabel('Country').selectOption('USA');
await page.getByLabel('Accept Terms').check();

// Verify form state
await expect(page.getByLabel('Accept Terms')).toBeChecked();
```

### File Uploads
```javascript
await page.getByLabel('Upload File').setInputFiles('path/to/file.pdf');
// Or multiple files
await page.getByLabel('Upload Files').setInputFiles([
  'file1.pdf',
  'file2.pdf'
]);
```

### Modal/Dialog Handling
```javascript
// Listen for dialog before triggering action
page.on('dialog', dialog => dialog.accept());
await page.getByRole('button', { name: 'Delete' }).click();
```

### Network Interception
```javascript
// Mock API response
await page.route('**/api/users', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify([{ id: 1, name: 'Test User' }])
  });
});
```

---

## Custom Fixtures (ADVANCED)

```javascript
// fixtures/customFixtures.js
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.TEST_USER, process.env.TEST_PASSWORD);
    await use(page);
  },
  
  testData: async ({}, use) => {
    const data = {
      validUser: { email: 'valid@test.com', password: 'pass123' },
      invalidUser: { email: 'invalid@test.com', password: 'wrong' }
    };
    await use(data);
  }
});

// Use in tests
test('should access dashboard', async ({ authenticatedPage }) => {
  await expect(authenticatedPage).toHaveURL(/.*dashboard/);
});
```

---

## Debugging Commands

```bash
# Run with UI mode (RECOMMENDED for development)
npx playwright test --ui

# Run in headed mode
npx playwright test --headed

# Debug specific test
npx playwright test --debug auth.spec.js

# Run with trace
npx playwright test --trace on

# Show report
npx playwright show-report

# Generate code
npx playwright codegen http://localhost:3000
```

---

## Code Review Checklist

Before committing, verify:
- [ ] All locators use semantic selectors (getByRole, getByLabel)
- [ ] No hardcoded waits (waitForTimeout)
- [ ] Tests are independent and can run in any order
- [ ] Page Objects are used for all pages
- [ ] Test names clearly describe what is tested
- [ ] No sensitive data is hardcoded
- [ ] Tests follow the AAA pattern (Arrange, Act, Assert)
- [ ] Error scenarios are tested
- [ ] Tests run in parallel without conflicts

---

## When AI Generates Code

**ALWAYS:**
1. Create or update Page Object Models first
2. Use semantic locators (getByRole, getByLabel)
3. Follow the test structure template
4. Add test.step() for clarity
5. Include meaningful assertions
6. Handle edge cases

**NEVER:**
1. Generate tests without Page Objects
2. Use CSS selectors as first choice
3. Add arbitrary waits
4. Create dependent tests
5. Hardcode test data in test files

---

## Environment Variables Template

```env
# .env.example
BASE_URL=http://localhost:3000
TEST_USER=test@example.com
TEST_PASSWORD=SecurePassword123
API_BASE_URL=http://localhost:3001/api
HEADLESS=true
```

---

## Remember
- **Test user behavior, not implementation**
- **Keep tests simple and focused**
- **One assertion concept per test**
- **Tests are documentation - make them readable**
- **Maintainability > Cleverness**

---

This guide must be followed for ALL Playwright code generation and modifications.
# Internationalization (i18n) Guide

This guide explains how the internationalization system works in SpeakNative AI and how to add new languages or translations.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [How to Use Translations](#how-to-use-translations)
- [Adding a New Language](#adding-a-new-language)
- [Migration Checklist](#migration-checklist)
- [Best Practices](#best-practices)

## Overview

SpeakNative AI uses **next-intl** for internationalization. The app currently supports:
- 🇬🇧 English (default)
- 🇪🇸 Spanish

The i18n system works in both **web** and **Electron** modes.

## Architecture

### Key Files

```
├── messages/
│   ├── en.json          # English translations
│   └── es.json          # Spanish translations
├── src/
│   ├── i18n/
│   │   ├── config.ts    # Locale configuration
│   │   └── request.ts   # Server-side i18n config
│   ├── lib/
│   │   ├── locale-context.tsx   # Client-side locale provider
│   │   └── locale-storage.ts    # Cookie-based locale persistence
│   └── components/ui/
│       └── language-switcher.tsx  # Language switcher component
```

### How It Works

1. **Locale Storage**: User's language preference is stored in a cookie (`NEXT_LOCALE`)
2. **Locale Provider**: `LocaleProvider` wraps the app and provides translation context
3. **Translation Hook**: Components use `useTranslations()` to access translations
4. **Language Switcher**: Globe icon button toggles between available languages

## How to Use Translations

### Basic Usage

```tsx
'use client'

import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations()

  return <h1>{t('common.appName')}</h1>
}
```

### Scoped Translations

For better organization, use scoped translations:

```tsx
'use client'

import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('auth.login')

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  )
}
```

### Dynamic Values

Pass variables to translations:

```tsx
const t = useTranslations()

// Translation: "Welcome, {username}!"
<span>{t('dashboard.welcomeUser', { username: user.name })}</span>
```

### Translation File Structure

```json
{
  "common": {
    "appName": "SpeakNative AI",
    "loading": "Loading..."
  },
  "auth": {
    "login": {
      "title": "Welcome back",
      "subtitle": "Sign in to continue"
    }
  },
  "fix": {
    "title": "Fix My English",
    "description": "Get AI-powered corrections",
    "examples": {
      "casual": {
        "text": "Example text",
        "description": "Example description"
      }
    }
  }
}
```

## Adding a New Language

### Step 1: Add Language to Config

Edit `src/i18n/config.ts`:

```typescript
export const locales = ['en', 'es', 'fr'] as const // Add 'fr'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français'  // Add this
}
```

### Step 2: Create Translation File

Create `messages/fr.json` and copy the structure from `messages/en.json`:

```bash
cp messages/en.json messages/fr.json
```

Then translate all values in the new file.

### Step 3: Test

The language switcher will automatically include the new language!

## Migration Checklist

To migrate a component from hardcoded text to translations:

### ✅ Checklist for Each Component

1. **Import the hook**
   ```tsx
   import { useTranslations } from 'next-intl'
   ```

2. **Add the translation hook**
   ```tsx
   const t = useTranslations() // or useTranslations('scope')
   ```

3. **Replace hardcoded strings**
   - Find all user-facing text
   - Add keys to translation files
   - Replace strings with `t('key')`

4. **Update both language files**
   - Add keys to `messages/en.json`
   - Add translations to `messages/es.json`

### Example Migration

**Before:**
```tsx
export default function MyComponent() {
  return (
    <div>
      <h1>Welcome</h1>
      <p>Please log in to continue</p>
    </div>
  )
}
```

**After:**
```tsx
import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations('auth')

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('loginPrompt')}</p>
    </div>
  )
}
```

**Translation files:**

`messages/en.json`:
```json
{
  "auth": {
    "welcome": "Welcome",
    "loginPrompt": "Please log in to continue"
  }
}
```

`messages/es.json`:
```json
{
  "auth": {
    "welcome": "Bienvenido",
    "loginPrompt": "Por favor, inicia sesión para continuar"
  }
}
```

## Best Practices

### 1. **Use Descriptive Keys**
✅ Good: `auth.login.passwordTooLong`
❌ Bad: `error1`

### 2. **Group Related Translations**
```json
{
  "dashboard": {
    "tabs": {
      "fix": "Fix My English",
      "translate": "Smart Translator",
      "define": "Word Definitions"
    }
  }
}
```

### 3. **Keep Common Strings in `common`**
```json
{
  "common": {
    "appName": "SpeakNative AI",
    "loading": "Loading...",
    "email": "Email",
    "password": "Password"
  }
}
```

### 4. **Use Scoped Translations**
Instead of:
```tsx
const t = useTranslations()
t('fix.title')
t('fix.description')
```

Use:
```tsx
const t = useTranslations('fix')
t('title')
t('description')
```

### 5. **Handle Plurals and Dynamic Content**
```json
{
  "items": {
    "count": "You have {count} items"
  }
}
```

```tsx
t('items.count', { count: items.length })
```

### 6. **Don't Translate**
- API endpoints
- Environment variables
- Technical error codes
- User-generated content
- Email addresses
- URLs (unless they're localized routes)

## Components Already Migrated

- ✅ Dashboard page (`src/app/dashboard/page.tsx`)
- ✅ Login page (`src/app/login/page.tsx`)
- ✅ Language switcher (`src/components/ui/language-switcher.tsx`)
- ✅ Example buttons (`src/app/dashboard/components/shared/ExampleButtons.tsx`)
- ✅ Fix component (partial - `src/app/dashboard/components/Fix.tsx`)

## Components To Migrate

- [ ] Register page (`src/app/register/page.tsx`)
- [ ] Landing page (`src/app/page.tsx`)
- [ ] Translate component (`src/app/dashboard/components/Translate.tsx`)
- [ ] Define component (`src/app/dashboard/components/Define.tsx`)
- [ ] Quick access page (`src/app/quick-access/page.tsx`)
- [ ] Inline context hint (`src/app/dashboard/components/shared/InlineContextHint.tsx`)

## Testing Translations

### Manual Testing

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Navigate to the app** at http://localhost:3000

3. **Click the language switcher** (globe icon)

4. **Verify all text changes** to the selected language

### Automated Testing (Future)

Consider adding tests for:
- All translation keys exist in all languages
- No missing translations
- Dynamic values work correctly

## Troubleshooting

### Issue: Translations not loading

**Solution**: Check that:
1. `LocaleProvider` is wrapping your app in `layout.tsx`
2. Translation files are valid JSON
3. Component is using `'use client'` directive

### Issue: Switching language doesn't work

**Solution**:
1. Clear browser cookies
2. Check that `locale-storage.ts` is saving to cookies correctly
3. Verify the language switcher is using `useLocale()` hook

### Issue: Some text not translating

**Solution**:
1. Verify the translation key exists in both language files
2. Check that the component is using `useTranslations()`
3. Ensure the key path is correct (e.g., `auth.login.title`)

## Future Enhancements

- [ ] Add more languages (French, German, Portuguese, etc.)
- [ ] Implement locale-based date/time formatting
- [ ] Add RTL support for Arabic/Hebrew
- [ ] Create translation validation tests
- [ ] Add automated translation workflow (e.g., Crowdin)
- [ ] Implement locale-based number/currency formatting

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Guide](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Translation Best Practices](https://phrase.com/blog/posts/translation-best-practices/)

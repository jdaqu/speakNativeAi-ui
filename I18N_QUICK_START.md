# i18n Quick Start Guide 🌍

## 🚀 Quick Setup Summary

✅ **Installed**: `next-intl`
✅ **Languages**: English (en) & Spanish (es)
✅ **Persistence**: Cookie-based (`NEXT_LOCALE`)
✅ **Works in**: Web & Electron modes

## 📝 How to Use in a Component

### 1. Import and Initialize

```tsx
'use client'

import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations() // or useTranslations('scopeName')

  return <h1>{t('common.appName')}</h1>
}
```

### 2. Add Translation Keys

**messages/en.json:**
```json
{
  "common": {
    "appName": "SpeakNative AI"
  }
}
```

**messages/es.json:**
```json
{
  "common": {
    "appName": "SpeakNative AI"
  }
}
```

### 3. Use the Language Switcher

Already added! Just import it:

```tsx
import { LanguageSwitcher } from '@/components/ui'

<LanguageSwitcher />
```

## 🔑 Translation Examples

### Basic Translation
```tsx
const t = useTranslations()
<p>{t('auth.login.title')}</p>
```

### With Variables
```tsx
// Translation: "Welcome, {username}!"
<p>{t('dashboard.welcomeUser', { username: user.name })}</p>
```

### Scoped for Cleaner Code
```tsx
const t = useTranslations('auth.login')
<h1>{t('title')}</h1>  // instead of t('auth.login.title')
```

## 📂 Translation File Structure

```json
{
  "common": {
    "appName": "SpeakNative AI",
    "loading": "Loading...",
    "email": "Email",
    "password": "Password"
  },
  "auth": {
    "login": {
      "title": "Welcome back",
      "subtitle": "Sign in to continue"
    }
  },
  "dashboard": {
    "welcomeUser": "Welcome, {username}!",
    "tabs": {
      "fix": "Fix My English",
      "translate": "Smart Translator"
    }
  }
}
```

## ➕ Adding a New Language

1. **Update config** (`src/i18n/config.ts`):
```typescript
export const locales = ['en', 'es', 'fr'] as const

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français'
}
```

2. **Create translation file**:
```bash
cp messages/en.json messages/fr.json
# Then translate all values in fr.json
```

3. **Done!** The language switcher will automatically include it.

## ✅ Migration Checklist (Per Component)

- [ ] Add `'use client'` directive if not present
- [ ] Import: `import { useTranslations } from 'next-intl'`
- [ ] Initialize: `const t = useTranslations()` or `const t = useTranslations('scope')`
- [ ] Find all hardcoded user-facing text
- [ ] Add keys to both `messages/en.json` and `messages/es.json`
- [ ] Replace strings with `t('key')` or `t('key', { variable })`
- [ ] Test by switching languages

## 🔍 Where Are Translations?

- **English**: `messages/en.json`
- **Spanish**: `messages/es.json`
- **Configuration**: `src/i18n/config.ts`
- **Locale Provider**: `src/lib/locale-context.tsx`
- **Language Switcher**: `src/components/ui/language-switcher.tsx`

## 📦 Already Translated Components

- ✅ Dashboard (`src/app/dashboard/page.tsx`)
- ✅ Login (`src/app/login/page.tsx`)
- ✅ Language Switcher
- ✅ Example Buttons
- ✅ Fix Component (partial)

## 🚧 Components To Translate

See full list in `I18N_GUIDE.md`

## 🐛 Common Issues

### Text not translating?
1. Check `LocaleProvider` wraps the app in `layout.tsx` ✅ (already done)
2. Verify translation key exists in BOTH language files
3. Component must use `'use client'`

### Language switcher not appearing?
```tsx
import { LanguageSwitcher } from '@/components/ui'

<LanguageSwitcher />
```

### Switching doesn't work?
- Clear browser cookies
- Hard refresh (Cmd/Ctrl + Shift + R)

## 📚 Full Documentation

For detailed info, see: `I18N_GUIDE.md`

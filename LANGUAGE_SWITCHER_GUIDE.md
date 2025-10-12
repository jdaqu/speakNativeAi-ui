# Language Switcher UI Guide 🌍

The language switcher now comes in **3 beautiful variants** to fit different parts of your app!

## 🎨 Variants

### 1. **LanguageSwitcher** (Default - Dropdown)
**Best for**: Main navigation, headers, settings pages

**Features**:
- ✨ Elegant dropdown with flag emojis
- 🎯 Shows current language clearly
- ✅ Checkmark on selected language
- 📱 Smooth animations
- 🔄 Chevron rotates when open
- 🖱️ Click outside to close

**Usage**:
```tsx
import { LanguageSwitcher } from '@/components/ui'

<LanguageSwitcher />
```

**Appearance**:
```
┌─────────────────────┐
│ 🌐 🇬🇧 English  ▼  │  ← Button
└─────────────────────┘
        ↓ (when clicked)
┌──────────────────────────┐
│ SELECT LANGUAGE          │
├──────────────────────────┤
│ 🇬🇧  English        ✓   │  ← Selected
│ 🇪🇸  Español            │
└──────────────────────────┘
```

---

### 2. **LanguageSwitcherCompact** (Toggle)
**Best for**: Mobile views, tight spaces, toolbars

**Features**:
- 🔀 Simple toggle between languages
- 📱 Responsive (hides text on mobile)
- 🎯 Flag emoji for quick recognition
- ⚡ One-click switching

**Usage**:
```tsx
import { LanguageSwitcherCompact } from '@/components/ui'

<LanguageSwitcherCompact />
```

**Appearance**:
```
Desktop: [ 🇬🇧 English ]
Mobile:  [ 🇬🇧 ]
```

---

### 3. **LanguageSwitcherIcon** (Minimal Dropdown)
**Best for**: Login/Register pages, minimal UIs

**Features**:
- 🌐 Globe icon only
- 💧 Compact dropdown on click
- 🎨 Minimal design
- ✅ Selected state indicator

**Usage**:
```tsx
import { LanguageSwitcherIcon } from '@/components/ui'

<LanguageSwitcherIcon />
```

**Appearance**:
```
[ 🌐 ]  ← Just a globe icon
  ↓ (when clicked)
┌─────────────────┐
│ 🇬🇧  English  ✓│
│ 🇪🇸  Español   │
└─────────────────┘
```

---

## 🎯 Recommended Usage by Page

| Page/Component | Recommended Variant | Why |
|----------------|---------------------|-----|
| Dashboard Header | `LanguageSwitcher` | Professional, clear |
| Login/Register | `LanguageSwitcherIcon` | Minimal, unobtrusive |
| Mobile Menu | `LanguageSwitcherCompact` | Space-efficient |
| Settings Page | `LanguageSwitcher` | Full context |
| Quick Access (Electron) | `LanguageSwitcherIcon` | Compact for popup |

---

## 🎨 Visual Features

### All Variants Include:
- **Flag Emojis**: 🇬🇧 English, 🇪🇸 Español
- **Hover Effects**: Smooth color transitions
- **Active State**: Primary color highlight for selected language
- **Animations**: Fade in/slide down for dropdowns
- **Click Outside**: Dropdowns auto-close when clicking elsewhere
- **Accessibility**: Proper ARIA labels and keyboard support

### Color Scheme:
- **Primary**: Blue accent for selected state
- **Hover**: Subtle gray background
- **Border**: Light gray for definition
- **Shadow**: Soft shadow for dropdown depth

---

## 🔧 Customization

### Changing the Flag Emojis
Edit the `localeFlags` object in `language-switcher.tsx`:

```tsx
const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',  // or '🇺🇸' for American English
  es: '🇪🇸',
  fr: '🇫🇷',  // Add new languages
}
```

### Styling Adjustments

All variants accept className props for customization:

```tsx
<LanguageSwitcher className="custom-styles" />
```

Common customizations:
```tsx
// Larger size
<LanguageSwitcher className="min-w-[150px]" />

// Different colors
<LanguageSwitcher className="text-blue-600 hover:text-blue-800" />

// Custom positioning
<LanguageSwitcher className="absolute top-4 right-4" />
```

---

## 📱 Responsive Behavior

### LanguageSwitcher (Default)
- Desktop: Full dropdown with labels
- Mobile: Same (works well)
- Tablet: Same

### LanguageSwitcherCompact
- Desktop: Flag + text
- Mobile: Flag only (text hidden with `hidden sm:inline`)
- Tablet: Flag + text

### LanguageSwitcherIcon
- All devices: Icon only (most space-efficient)

---

## 🚀 Migration from Old Switcher

**Old** (simple toggle):
```tsx
import { LanguageSwitcher } from '@/components/ui'
<LanguageSwitcher />
```

**New** (choose based on use case):
```tsx
// For headers (dropdown)
import { LanguageSwitcher } from '@/components/ui'
<LanguageSwitcher />

// For auth pages (icon)
import { LanguageSwitcherIcon } from '@/components/ui'
<LanguageSwitcherIcon />

// For mobile (compact toggle)
import { LanguageSwitcherCompact } from '@/components/ui'
<LanguageSwitcherCompact />
```

The old `LanguageSwitcher` import **still works** but now shows the improved dropdown version!

---

## 🎨 UI/UX Improvements

### What's Better:
1. **Visual Clarity**: Flag emojis make languages instantly recognizable
2. **Better Feedback**: Checkmark shows selected language
3. **Smooth Animations**: Professional feel with subtle transitions
4. **Click Outside**: Intuitive behavior - dropdown closes automatically
5. **Responsive Design**: Different variants for different contexts
6. **Accessibility**: Proper hover states and focus indicators
7. **Scalable**: Easy to add more languages (just add to config)

### Design Principles:
- **Minimalist**: Clean, uncluttered design
- **Familiar**: Standard dropdown pattern users expect
- **Efficient**: One click to change language
- **Delightful**: Smooth animations and transitions

---

## 📝 Examples in Context

### Dashboard Header
```tsx
<header className="bg-white border-b">
  <div className="container mx-auto px-4 py-4 flex justify-between items-center">
    <div className="flex items-center space-x-2">
      <Brain className="h-8 w-8 text-primary" />
      <span className="text-2xl font-bold">SpeakNative AI</span>
    </div>
    <div className="flex items-center space-x-4">
      <LanguageSwitcher />  {/* ← Dropdown version */}
      <Button onClick={logout}>Logout</Button>
    </div>
  </div>
</header>
```

### Login Page (Top Right)
```tsx
<div className="min-h-screen flex items-center justify-center">
  <div className="w-full max-w-md">
    <div className="flex justify-end mb-2">
      <LanguageSwitcherIcon />  {/* ← Icon version */}
    </div>
    {/* Login form */}
  </div>
</div>
```

### Mobile Navigation
```tsx
<nav className="md:hidden">
  <div className="flex items-center justify-between p-4">
    <Logo />
    <LanguageSwitcherCompact />  {/* ← Compact version */}
  </div>
</nav>
```

---

## 🌟 Pro Tips

1. **Consistency**: Use the same variant throughout similar contexts
2. **Visibility**: Place in top-right for Western UIs (conventional)
3. **Grouping**: Keep near other user settings/preferences
4. **Testing**: Test with all supported languages to ensure proper display
5. **Mobile**: On mobile, consider using `LanguageSwitcherIcon` to save space

---

## 🎯 Quick Decision Guide

**Need a dropdown?** → `LanguageSwitcher`
**Need to save space?** → `LanguageSwitcherCompact` or `LanguageSwitcherIcon`
**On auth pages?** → `LanguageSwitcherIcon`
**In main header?** → `LanguageSwitcher`
**Mobile menu?** → `LanguageSwitcherCompact`

---

Enjoy the improved language switcher! 🎉

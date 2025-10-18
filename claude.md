# SpeakNative AI - Frontend & Desktop App Documentation

This document provides a complete technical guide to the SpeakNative AI frontend, built with Next.js and TypeScript, and the cross-platform desktop application, built with Electron.

## 🎨 Frontend Overview

The frontend is a modern, responsive web application that serves as the user interface for all of SpeakNative's features. It is designed to run both in a web browser and as a standalone desktop application.

-   **Framework**: Next.js 14 with App Router
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS with shadcn/ui components
-   **Authentication**: Context-based JWT management
-   **Internationalization**: next-intl (English & Spanish supported)

### Project Structure
```
frontend/
├── electron/                   # Electron-specific files
│   ├── main.js                 # Main process (app lifecycle, windows, shortcuts)
│   └── preload.js              # Secure IPC bridge between main and renderer
├── messages/                   # i18n translation files
│   ├── en.json                 # English translations
│   └── es.json                 # Spanish translations
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Main user-facing feature pages
│   │   ├── quick-access/       # UI for the Electron quick-access popup
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   └── layout.tsx          # Root layout with AuthProvider & LocaleProvider
│   ├── components/
│   │   └── ui/                 # Reusable shadcn/ui components
│   ├── i18n/                   # Internationalization configuration
│   │   ├── config.ts           # Locale settings
│   │   └── request.ts          # Server-side i18n config
│   └── lib/
│       ├── auth-context.tsx    # Global authentication state management
│       ├── locale-context.tsx  # Global locale state management
│       ├── locale-storage.ts   # Cookie-based locale persistence
│       ├── api.ts              # Centralized API client (Electron-aware)
│       └── utils.ts            # Utility functions
├── scripts/
│   └── add-language.js         # Helper script to add new languages
├── package.json                # Dependencies and scripts
├── next.config.ts              # Next.js configuration (Electron-aware)
├── I18N_GUIDE.md              # Complete i18n documentation
├── I18N_QUICK_START.md        # Quick reference for i18n
└── I18N_IMPLEMENTATION_SUMMARY.md  # Implementation details
```

### Core Components

-   **API Client (`src/lib/api.ts`)**: A centralized Axios client for communicating with the backend. It is "Electron-aware," meaning it automatically switches the base URL from a relative path (`/api`) in the web app to a direct URL (`http://localhost:8000/api`) when running inside Electron.
-   **Auth Context (`src/lib/auth-context.tsx`)**: A React Context that manages the user's authentication state, including the JWT token, user information, and loading status. It provides simple hooks for login, logout, and registration.
-   **Locale Context (`src/lib/locale-context.tsx`)**: A React Context that manages the user's language preference. The selected language is persisted in cookies and automatically loads the appropriate translation file. Works seamlessly in both web and Electron modes.

### Internationalization (i18n)

The app supports multiple languages using **next-intl**:

-   **Current Languages**: English (en), Spanish (es)
-   **Persistence**: User's language choice is saved in a cookie (`NEXT_LOCALE`)
-   **Switching**: Globe icon (🌍) in the header toggles between languages
-   **Adding Languages**: Use `node scripts/add-language.js <code> <name>` (e.g., `node scripts/add-language.js fr Français`)

**Documentation**:
-   `I18N_GUIDE.md` - Complete guide with best practices
-   `I18N_QUICK_START.md` - Quick reference for developers
-   `I18N_IMPLEMENTATION_SUMMARY.md` - Implementation details and migration status

**Usage in components**:
```tsx
import { useTranslations } from 'next-intl'

function MyComponent() {
  const t = useTranslations('auth.login')
  return <h1>{t('title')}</h1>
}
```

#### Inline Context Input (Fix / Translate / Define)

All features support inline context entry directly inside the main input using braces. Example formats:

- Fix: `I goes to store yesterday {casual chat with coworkers}`
- Translate: `Necesito una reunión {business meeting}`
- Define: `serendipity {literature class}`

The app will:

- Extract the text and any `{context}` blocks
- Send the context as a separate parameter to the backend
- Show a small hint below the input: **Context: <detected context>**

Multiple contexts are supported: `{meeting} {formal}` → sent as `"meeting; formal"`.

---

## 🖥️ Desktop App (Electron)

The desktop app provides native system integration for SpeakNative AI, reusing the same Next.js frontend for a consistent user experience.

### Architecture Overview
The app consists of a **main process** (`electron/main.js`) that manages windows and system events, and **renderer processes** (the Next.js UI) that display content. A secure **preload script** (`electron/preload.js`) facilitates communication between them.

```
┌──────────────────────────────────────┐
│          Electron Main Process         │
│  - Manages Windows                     │
│  - Registers Global Shortcuts        │
│  - Creates System Tray Icon          │
│  - Handles IPC from Renderer         │
└──────────────────┬───────────────────┘
                   │ IPC
┌──────────────────▼───────────────────┐
│        Renderer Process (Next.js UI)   │
│  - Displays Web App Interface        │
│  - Runs in Main Window or Popup      │
│  - Calls Preload Script APIs         │
└──────────────────────────────────────┘
```

### Key Features
-   **Global Shortcut**: Press `Cmd+Shift+S` (Mac) or `Ctrl+Shift+S` (Windows/Linux) from any application to instantly open the Quick Access popup.
-   **Quick Access Popup**: A compact, tabbed interface for the core "Fix," "Translate," and "Define" features. It is designed for fast, frequent interactions without opening the full application.
-   **System Tray Integration**: The app can run in the background and is always accessible from the system tray/menu bar.

### Development Workflow

1.  **Start the Backend**: Ensure the FastAPI server is running on `localhost:8000`.
2.  **Run the Electron Dev Script**:
    ```bash
    cd frontend
    npm run electron:dev
    ```
    This command sequence automatically:
    1.  Starts the Next.js development server on `localhost:3000`.
    2.  Waits for the server to be ready.
    3.  Launches the Electron application, which loads the UI from the dev server.

### Build & Package for Production
Use the scripts in `package.json` to build a distributable application:
-   `npm run electron:pack`: Builds the application for your current platform into the `dist/` folder.
-   `npm run electron:build`: Creates a production-ready installer.

### Releasing a New Desktop App Version

Follow these steps to create a new release and make it available for download on the webapp:

#### 1. Build the Desktop App

```bash
npm run electron:pack
```

This will:
- Build the Next.js app with `ELECTRON=true` (static export mode)
- Run `fix-paths.js` to convert absolute paths to relative paths (required for Electron's `file://` protocol)
- Package the app for both Intel and ARM64 Mac architectures
- Generate `.dmg` installers in the `dist/` folder

**Output files:**
- `dist/SpeakNative AI-0.1.0.dmg` (Intel Mac)
- `dist/SpeakNative AI-0.1.0-arm64.dmg` (Apple Silicon Mac)

#### 2. Commit and Tag the Release

```bash
# Commit any pending changes
git add -A
git commit -m "Release v0.1.X - description of changes"
git push

# Create and push a new version tag
git tag v0.1.X
git push origin v0.1.X
```

#### 3. Create GitHub Release

Use the GitHub CLI to create a release and upload the DMG files:

```bash
gh release create v0.1.X \
  "dist/SpeakNative AI-0.1.0-arm64.dmg" \
  "dist/SpeakNative AI-0.1.0.dmg" \
  --title "SpeakNative AI v0.1.X" \
  --notes "## Desktop App Release v0.1.X

### What's New
- Feature 1
- Feature 2
- Bug fixes

### Downloads
- **Mac (Apple Silicon)**: Download the ARM64 version for M1/M2/M3 Macs
- **Mac (Intel)**: Download the Intel version for Intel-based Macs

### Installation
1. Download the appropriate version for your Mac
2. Open the .dmg file
3. Drag SpeakNative AI to your Applications folder
4. Launch the app and sign in with your account"
```

**Alternative:** Create the release manually on GitHub:
1. Go to `https://github.com/jdaqu/speakNativeAi-ui/releases/new`
2. Select the tag you created
3. Add release notes
4. Upload the two DMG files from the `dist/` folder
5. Publish the release

#### 4. Verify the Release

Check that the release is live and accessible:

```bash
# Verify the latest release
curl -s https://api.github.com/repos/jdaqu/speakNativeAi-ui/releases/latest | grep -E '"tag_name"|"name".*\.dmg"|"browser_download_url"'
```

#### 5. How Downloads Work on the Webapp

The webapp automatically fetches and displays download links from GitHub Releases:

**Download Flow:**
1. User visits the homepage (`src/app/page.tsx`)
2. The page calls `getDownloadUrls()` from `src/lib/github-releases.ts`
3. This function fetches the latest release from: `https://api.github.com/repos/jdaqu/speakNativeAi-ui/releases/latest`
4. It extracts the download URLs for the ARM64 and Intel DMG files
5. Download buttons are displayed with direct links to the GitHub release assets

**Fallback Strategy:**
If the GitHub API fails, the app falls back to:
- `/downloads/SpeakNativeAI-mac-arm64.dmg`
- `/downloads/SpeakNativeAI-mac-intel.dmg`

To use the fallback, place DMG files in `public/downloads/` and they will be served by the webapp.

**Important Files:**
- `src/lib/github-releases.ts`: Handles fetching release info from GitHub API
- `src/app/page.tsx` (lines 282-392): Download section UI with platform detection
- Repository settings: `GITHUB_OWNER = 'jdaqu'`, `GITHUB_REPO = 'speakNativeAi-ui'`

### Configuration for Electron

-   **`next.config.ts`**: When the `ELECTRON` environment variable is true, the config switches to `output: 'export'` for static HTML generation, which is required for Electron packaging. It also adjusts other settings like image optimization and URL handling.
-   **`package.json`**: Contains the `electron:dev` and `electron:pack` scripts, along with Electron-related dependencies (`electron`, `electron-builder`, `wait-on`).
-   **`fix-paths.js`**: Post-build script that converts absolute paths (`/_next/...`) to relative paths (`../_next/...`) in HTML and CSS files, which is required for Electron's `file://` protocol to load assets correctly.

### Troubleshooting Common Issues

-   **Global Shortcut Not Working**:
    -   **Cause**: Another application is using the same shortcut, or on macOS, the app lacks Accessibility permissions.
    -   **Solution**: Check for conflicting apps. On macOS, go to `System Settings > Privacy & Security > Accessibility` and add your terminal or the built application to the list.

-   **Blank Screen in Popup**:
    -   **Cause**: The Next.js dev server (`localhost:3000`) is not running, or there is a JavaScript hydration error.
    -   **Solution**: Ensure the dev server is running. Open Electron's DevTools (`Cmd+Option+I` / `Ctrl+Shift+I`) to check the console for errors.

-   **API Calls Failing in Electron**:
    -   **Cause**: The backend server (`localhost:8000`) is not running, or there's a CORS issue.
    -   **Solution**: Ensure the backend is running and accessible. The backend is pre-configured with CORS to allow requests from `localhost:3000`, but if you change domains, you will need to update the CORS settings in `backend/app/main.py`.

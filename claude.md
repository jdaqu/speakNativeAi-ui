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

### Verification & Code Quality Scripts

Before deploying or committing code, use these scripts to ensure your code passes all checks that Vercel (or any CI/CD) will run:

#### Available Scripts

-   **`npm run typecheck`**: Runs TypeScript type checking without generating any build artifacts. Fast and useful for catching type errors.
-   **`npm run lint`**: Runs ESLint to check for code quality and style issues. This is what Vercel runs during deployment.
-   **`npm run lint:fix`**: Automatically fixes ESLint issues that can be auto-corrected (like formatting, quotes, etc.).
-   **`npm run verify`**: Runs both `typecheck` and `lint` in sequence. **Recommended before every commit/push.**

#### When to Use

1.  **Before committing**: Run `npm run verify` to catch errors early
2.  **Before pushing**: Ensures your code will pass Vercel's deployment checks
3.  **During development**: Use `npm run lint:fix` to automatically fix common issues
4.  **CI/CD pipeline**: Add `npm run verify` to your GitHub Actions workflow

#### Why Use These Instead of `npm run build`?

-   **Much faster**: No compilation or asset generation
-   **Cleaner workspace**: Doesn't create the `.next` folder or production assets
-   **Same checks as Vercel**: Catches TypeScript errors and ESLint issues that would fail deployment
-   **Perfect for pre-commit hooks**: Quick validation before committing

**Example workflow:**
```bash
# Make your changes
# ...

# Verify everything passes
npm run verify

# If there are auto-fixable issues
npm run lint:fix

# Commit your changes
git add .
git commit -m "Your commit message"
```

### Build & Package for Production
Use the scripts in `package.json` to build a distributable application:
-   `npm run electron:pack`: Builds the application for your current platform into the `dist/` folder.
-   `npm run electron:build`: Creates a production-ready installer.

### Automated Desktop App Releases

Desktop app releases are **fully automated** via GitHub Actions. Every push to the `main` branch automatically creates a new release.

#### How It Works

1. **Auto-Versioning**: When code is pushed to `main`, GitHub Actions automatically increments the patch version (e.g., v1.0.4 → v1.0.5)
2. **Parallel Builds**: ARM64 and Intel versions build simultaneously (~15 minutes total)
3. **Security**: SHA256 checksums are generated for all downloads
4. **Release Creation**: GitHub Release is created automatically with DMG files and checksums
5. **Webapp Updates**: Download buttons automatically show the latest version

#### Release Workflow

**Triggers:**
- Every push to `main` branch (automatic)
- Manual trigger via GitHub Actions UI (fallback)

**What Happens Automatically:**
1. GitHub Actions fetches the latest git tag (e.g., v1.0.4)
2. Increments patch version → v1.0.5
3. Builds ARM64 and Intel DMGs in parallel
4. Generates SHA256 checksums for both files
5. Creates git tag `v1.0.5`
6. Creates GitHub Release with:
   - Release notes (commit messages since last version)
   - Download links for both architectures
   - SHA256 checksums for verification
   - Installation instructions

#### Manual Version Control

**To manually bump major or minor versions:**
```bash
# For a major version bump (1.0.5 → 2.0.0)
git tag v2.0.0
git push origin v2.0.0

# Next auto-release will use v2.0.0 as base → v2.0.1
```

**To skip a release:**
- Use `[skip ci]` in your commit message
- Or temporarily disable the workflow in GitHub Actions UI

**To fix a bad release:**
1. Delete the release in GitHub UI
2. Delete the tag: `git push origin :refs/tags/v1.0.x`
3. Next push to main will create a new release with the correct version

#### PR Verification

Before merging to `main`, all pull requests automatically:
- Run `npm run typecheck` (type checking)
- Run `npm run lint` (code quality)
- Build ARM64 version (quick verification)

This catches build issues before they reach production.

#### Monitoring Releases

**View release status:**
- Check GitHub Actions tab: https://github.com/jdaqu/speakNativeAi-ui/actions
- View latest release: https://github.com/jdaqu/speakNativeAi-ui/releases/latest

**Verify the release:**
```bash
# Check latest release via API
curl -s https://api.github.com/repos/jdaqu/speakNativeAi-ui/releases/latest | grep -E '"tag_name"|"name".*\.dmg"|"browser_download_url"'

# Verify downloaded file checksum
shasum -a 256 SpeakNativeAI-1.0.5-mac-arm64.dmg
# Compare with checksum in release notes
```

#### How Downloads Work on the Webapp

The webapp automatically fetches and displays download links from GitHub Releases:

**Download Flow:**
1. User visits the homepage (`src/app/page.tsx`)
2. The page calls `getDownloadUrls()` from `src/lib/github-releases.ts`
3. This function fetches the latest release from: `https://api.github.com/repos/jdaqu/speakNativeAi-ui/releases/latest`
4. It extracts the download URLs for the ARM64 and Intel DMG files
5. Download buttons display the latest version and direct download links

**Fallback Strategy:**
If the GitHub API fails, the app falls back to:
- `/downloads/SpeakNativeAI-mac-arm64.dmg`
- `/downloads/SpeakNativeAI-mac-intel.dmg`

To use the fallback, place DMG files in `public/downloads/` and they will be served by the webapp.

**Important Files:**
- `.github/workflows/release-desktop-app.yml`: Automated release workflow
- `.github/workflows/verify-desktop-build.yml`: PR verification workflow
- `src/lib/github-releases.ts`: Handles fetching release info from GitHub API
- `src/app/page.tsx`: Download section UI with platform detection
- Repository: `jdaqu/speakNativeAi-ui`

#### Local Testing (Development Only)

To test the build process locally without creating a release:

```bash
# Build both architectures locally
npm run electron:pack
```

This will:
- Build the Next.js app with `ELECTRON=true` (static export mode)
- Run `fix-paths.js` to convert absolute paths to relative paths
- Package the app for both Intel and ARM64 Mac architectures
- Generate `.dmg` installers in the `dist/` folder

Note: Local builds are for testing only. Production releases should always go through the automated GitHub Actions workflow.

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

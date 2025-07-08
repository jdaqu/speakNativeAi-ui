# SpeakNative AI - Frontend & Desktop App Documentation

This document provides a complete technical guide to the SpeakNative AI frontend, built with Next.js and TypeScript, and the cross-platform desktop application, built with Electron.

## 🎨 Frontend Overview

The frontend is a modern, responsive web application that serves as the user interface for all of SpeakNative's features. It is designed to run both in a web browser and as a standalone desktop application.

-   **Framework**: Next.js 14 with App Router
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS with shadcn/ui components
-   **Authentication**: Context-based JWT management

### Project Structure
```
frontend/
├── electron/                   # Electron-specific files
│   ├── main.js                 # Main process (app lifecycle, windows, shortcuts)
│   └── preload.js              # Secure IPC bridge between main and renderer
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Main user-facing feature pages
│   │   ├── quick-access/       # UI for the Electron quick-access popup
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   └── layout.tsx          # Root layout with AuthProvider
│   ├── components/
│   │   └── ui/                 # Reusable shadcn/ui components
│   └── lib/
│       ├── auth-context.tsx    # Global authentication state management
│       ├── api.ts              # Centralized API client (Electron-aware)
│       └── utils.ts            # Utility functions
├── package.json                # Dependencies and scripts
└── next.config.ts              # Next.js configuration (Electron-aware)
```

### Core Components

-   **API Client (`src/lib/api.ts`)**: A centralized Axios client for communicating with the backend. It is "Electron-aware," meaning it automatically switches the base URL from a relative path (`/api`) in the web app to a direct URL (`http://localhost:8000/api`) when running inside Electron.
-   **Auth Context (`src/lib/auth-context.tsx`)**: A React Context that manages the user's authentication state, including the JWT token, user information, and loading status. It provides simple hooks for login, logout, and registration.

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

### Configuration for Electron

-   **`next.config.ts`**: When the `ELECTRON` environment variable is true, the config switches to `output: 'export'` for static HTML generation, which is required for Electron packaging. It also adjusts other settings like image optimization and URL handling.
-   **`package.json`**: Contains the `electron:dev` and `electron:pack` scripts, along with Electron-related dependencies (`electron`, `electron-builder`, `wait-on`).

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

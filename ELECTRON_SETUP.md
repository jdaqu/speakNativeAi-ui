# 🖥️ SpeakNative AI Desktop App Setup

This guide will help you set up and run the SpeakNative AI desktop application built with Electron.

## 🎯 Features

- **Global Shortcut**: Press `Cmd+Shift+S` (Mac) or `Ctrl+Shift+S` (Windows/Linux) anywhere to open quick access
- **System Tray**: Always running in the background, accessible from your system tray
- **Quick Access Popup**: Compact interface for fixing, translating, and defining words
- **Multi-platform**: Works on macOS, Windows, and Linux

## 📋 Prerequisites

1. **Backend running**: Make sure your FastAPI backend is running on `http://localhost:8000`
2. **Node.js**: Version 18+ installed
3. **Dependencies**: All npm packages installed

## 🚀 Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Make sure backend is running**:
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## 🔧 Development Mode

Run the app in development mode (with hot reload):

```bash
npm run electron:dev
```

This will:
- Start the Next.js development server
- Wait for it to be ready
- Launch the Electron app
- Enable live reload for development

## 📦 Building for Production

### 1. Build the app:
```bash
npm run electron:pack
```

### 2. Create installer:
```bash
npm run electron:build
```

### 3. Build for distribution:
```bash
npm run electron:dist
```

## 🎮 How to Use

### Main Window
- Full-featured web interface
- All learning features available
- Comprehensive results and analytics

### Quick Access (Global Shortcut)
1. Press `Cmd+Shift+S` (Mac) or `Ctrl+Shift+S` (Windows/Linux) anywhere
2. A popup window appears near your cursor
3. Choose from 3 tabs:
   - **Fix**: Correct English grammar and style
   - **Translate**: Translate between languages
   - **Define**: Look up word definitions
4. Press Escape or click outside to close

### System Tray
- Right-click the tray icon for menu
- Double-click for quick access
- Always accessible in the background

## 🛠️ Troubleshooting

### Global Shortcut Not Working
- Make sure the app has accessibility permissions (macOS)
- Try restarting the app
- Check if another app is using the same shortcut

### Backend Connection Issues
- Verify backend is running on `http://localhost:8000`
- Check if port 8000 is available
- Ensure firewall isn't blocking connections

### Build Issues
- Clear node_modules and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  ```
- Make sure you have the latest version of electron-builder

## 📁 File Structure

```
frontend/
├── electron/
│   ├── main.js          # Main Electron process
│   ├── preload.js       # Preload script for security
│   └── icon-setup.md    # Icon setup instructions
├── src/
│   ├── app/
│   │   ├── quick-access/
│   │   │   ├── page.tsx    # Quick access popup
│   │   │   └── layout.tsx  # Minimal layout
│   │   └── ... (other pages)
│   └── ... (other components)
├── package.json         # Updated with Electron scripts
└── next.config.ts       # Configured for Electron
```

## 🎨 Customization

### Changing the Global Shortcut
Edit `electron/main.js` and modify the shortcut registration:

```javascript
const shortcut = process.platform === 'darwin' ? 'Cmd+Shift+S' : 'Ctrl+Shift+S'
```

### Adding App Icons
1. Create a 16x16 PNG icon for the system tray
2. Save it as `public/tray-icon.png`
3. Update the path in `electron/main.js`

### Popup Window Size
Modify the window dimensions in `electron/main.js`:

```javascript
quickAccessWindow = new BrowserWindow({
  width: 500,    // Adjust width
  height: 600,   // Adjust height
  // ... other options
})
```

## 🔐 Security Features

- **Context Isolation**: Renderer processes are isolated
- **Node Integration**: Disabled for security
- **Preload Script**: Secure communication between main and renderer
- **Direct API Access**: No proxy needed in Electron

## 🌐 Platform-Specific Notes

### macOS
- App may require accessibility permissions for global shortcuts
- System tray icon appears in the menu bar
- Shortcuts use `Cmd` key

### Windows
- System tray icon appears in the system tray
- Shortcuts use `Ctrl` key
- May need to allow app through Windows Defender

### Linux
- System tray support varies by desktop environment
- Shortcuts use `Ctrl` key
- AppImage format for easy distribution

## 🚨 Important Notes

1. **Backend Dependency**: The app requires the FastAPI backend to be running
2. **Network Access**: Needs internet connection for AI features
3. **Permissions**: May need accessibility permissions for global shortcuts
4. **Memory Usage**: Desktop app uses more memory than web version

## 🎯 Next Steps

1. **Start Backend**: Make sure FastAPI is running
2. **Install Dependencies**: Run `npm install`
3. **Test Development**: Run `npm run electron:dev`
4. **Try Global Shortcut**: Press `Cmd+Shift+S` or `Ctrl+Shift+S`
5. **Build Production**: Run `npm run electron:pack` when ready

## 📞 Support

If you encounter issues:
1. Check that the backend is running
2. Verify Node.js version (18+)
3. Check console for errors
4. Try rebuilding node_modules

The desktop app provides the same functionality as the web version but with convenient global access and system integration! 
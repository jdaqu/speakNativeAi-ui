# 🔧 Electron Desktop App Troubleshooting Guide

This guide covers common issues with the SpeakNative AI desktop app and their solutions.

## 🚨 Common Issues

### 1. App Won't Start

#### Symptoms
- Electron app fails to launch
- Console shows errors during startup
- No windows appear

#### Potential Causes & Solutions

**Missing Dependencies**
```bash
# Check if all dependencies are installed
cd frontend
npm install

# Check if Electron is properly installed
npx electron --version
```

**Port Conflicts**
```bash
# Check if port 3000 is already in use
lsof -i :3000

# Kill any processes using port 3000
pkill -f "port 3000"
```

**Backend Not Running**
```bash
# Verify backend is running
curl http://localhost:8000/docs

# Start backend if needed
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Global Shortcut Not Working

#### Symptoms
- Pressing `Cmd+Shift+S` (Mac) or `Ctrl+Shift+S` (Win/Linux) does nothing
- No popup appears

#### Solutions

**Check Shortcut Registration**
```javascript
// Add debug logging to electron/main.js
const registered = globalShortcut.register(shortcut, () => {
  console.log('Shortcut triggered!')
  showQuickAccess()
})

if (!registered) {
  console.log('Failed to register global shortcut')
}
```

**macOS Accessibility Permissions**
1. Go to System Preferences → Security & Privacy → Privacy
2. Select "Accessibility" from the left sidebar
3. Add your terminal app or Electron app to the list
4. Restart the Electron app

**Alternative Shortcut**
```javascript
// Try a different shortcut in electron/main.js
const shortcut = process.platform === 'darwin' ? 'Cmd+Shift+L' : 'Ctrl+Shift+L'
```

**Check for Conflicts**
- Another app might be using the same shortcut
- Try different key combinations
- Check system shortcuts in OS settings

### 3. Blank Screen in Popup

#### Symptoms
- Quick access popup appears but shows blank/white screen
- No content loads in the popup

#### Solutions

**Check Dev Server**
```bash
# Verify Next.js dev server is running
curl http://localhost:3000/quick-access

# Should return HTML content, not error
```

**Check Console Errors**
1. Open Electron DevTools (Cmd+Option+I / Ctrl+Shift+I)
2. Look for JavaScript errors
3. Check Network tab for failed requests

**Clear Electron Cache**
```bash
# Clear Electron user data
rm -rf ~/Library/Application\ Support/speaknative-desktop/  # macOS
rm -rf ~/.config/speaknative-desktop/                       # Linux
rm -rf %APPDATA%\speaknative-desktop\                       # Windows
```

**Hydration Error Fix**
Ensure fonts match between layouts:
```tsx
// src/app/quick-access/layout.tsx should match src/app/layout.tsx
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
```

### 4. API Calls Failing

#### Symptoms
- Features work in web browser but not in Electron
- Network errors in popup
- "Fix My English" button doesn't work

#### Solutions

**Check API Base URL**
```typescript
// Add debug logging to src/lib/api.ts
console.log('isElectron:', window.electronAPI?.isElectron)
console.log('API base URL:', api.defaults.baseURL)
```

**Verify Backend Connection**
```bash
# Test API directly
curl http://localhost:8000/api/fix \
  -H "Content-Type: application/json" \
  -d '{"phrase": "test phrase"}'
```

**Authentication Issues**
```bash
# Check if auth token is being sent
# In Electron DevTools Network tab
# Look for Authorization header in requests
```

**CORS Issues**
Add CORS headers to FastAPI backend:
```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5. System Tray Issues

#### Symptoms
- No system tray icon appears
- Tray icon shows but menu doesn't work
- App crashes when creating tray

#### Solutions

**Icon Loading Error**
```javascript
// electron/main.js - Add error handling
const createTray = () => {
  try {
    tray = new Tray(iconPath)
  } catch (error) {
    console.log('Tray icon failed to load:', error)
    // Continue without tray
    return
  }
}
```

**Platform-Specific Issues**
```javascript
// Skip tray on problematic platforms
if (process.platform === 'linux') {
  console.log('Skipping tray on Linux')
  return
}
```

**Missing Icon File**
```bash
# Check if favicon exists
ls -la frontend/src/app/favicon.ico

# Create simple tray icon if needed
cp frontend/src/app/favicon.ico frontend/public/tray-icon.png
```

### 6. Performance Issues

#### Symptoms
- App takes long time to start
- High memory usage
- Slow response times

#### Solutions

**Memory Optimization**
```javascript
// electron/main.js - Optimize window settings
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  webSecurity: true,
  spellcheck: false,        // Disable spell check
  enableRemoteModule: false // Disable remote module
}
```

**Startup Optimization**
```javascript
// Show window only when ready
mainWindow.once('ready-to-show', () => {
  mainWindow.show()
})
```

**Development vs Production**
```bash
# Production builds are faster
npm run electron:pack

# Development includes DevTools overhead
```

## 🛠️ Debugging Tools

### Electron DevTools
```javascript
// Enable DevTools in development
if (isDev) {
  mainWindow.webContents.openDevTools()
}
```

### Console Logging
```javascript
// Add debug logs throughout the app
console.log('Main window created')
console.log('Quick access triggered')
console.log('API call made:', response)
```

### Process Monitoring
```bash
# Monitor Electron processes
ps aux | grep -i electron

# Monitor memory usage
top -p $(pgrep -f electron)

# Monitor network activity
netstat -an | grep 3000
netstat -an | grep 8000
```

## 🔍 Step-by-Step Diagnosis

### Quick Health Check
```bash
# 1. Check all required processes
cd backend && source venv/bin/activate && python -c "import uvicorn; print('✓ Backend ready')"
cd frontend && npm list electron && echo "✓ Electron installed"
curl -s http://localhost:8000/docs > /dev/null && echo "✓ Backend running"
curl -s http://localhost:3000 > /dev/null && echo "✓ Frontend running"

# 2. Test Electron startup
cd frontend
NODE_ENV=development npx electron . 2>&1 | head -10
```

### Full Diagnostic
```bash
#!/bin/bash
# Save as check-electron.sh

echo "=== SpeakNative AI Desktop App Diagnostic ==="

# Check Node.js version
echo "Node.js version: $(node --version)"

# Check npm packages
echo "Electron version: $(npx electron --version)"

# Check processes
echo "Backend running: $(ps aux | grep uvicorn | grep -v grep | wc -l) process(es)"
echo "Frontend running: $(ps aux | grep 'next dev' | grep -v grep | wc -l) process(es)"
echo "Electron running: $(ps aux | grep -i electron | grep -v grep | wc -l) process(es)"

# Check ports
echo "Port 3000: $(lsof -i :3000 | wc -l) connection(s)"
echo "Port 8000: $(lsof -i :8000 | wc -l) connection(s)"

# Check API connectivity
echo "Backend API: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs)"
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)"

echo "=== End Diagnostic ==="
```

## 📋 Maintenance Tasks

### Weekly Checks
- [ ] Test global shortcut functionality
- [ ] Verify all three tabs work (Fix/Translate/Define)
- [ ] Check for console errors
- [ ] Monitor memory usage

### Monthly Tasks
- [ ] Update dependencies (`npm update`)
- [ ] Clear Electron cache
- [ ] Test on different platforms
- [ ] Review security settings

### When Issues Arise
1. **Reproduce the issue** consistently
2. **Check console logs** for errors
3. **Verify environment** (backend running, ports available)
4. **Test in web browser** first (isolate Electron-specific issues)
5. **Check this troubleshooting guide**
6. **Create minimal reproduction** if needed

## 🆘 Emergency Recovery

### Nuclear Option - Fresh Start
```bash
# 1. Kill all processes
pkill -f "electron"
pkill -f "next dev"
pkill -f "uvicorn"

# 2. Clear all caches
rm -rf frontend/node_modules
rm -rf frontend/.next
rm -rf ~/Library/Application\ Support/speaknative-desktop/

# 3. Reinstall everything
cd frontend
npm install

# 4. Restart services
cd ../backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

cd ../frontend
npm run electron:dev
```

### Contact Information
If issues persist:
1. Check the main DOCUMENTATION.md file
2. Review the ELECTRON_SETUP.md guide
3. Look for solutions in the project README
4. Create a detailed issue report with:
   - Operating system and version
   - Node.js version
   - Exact error messages
   - Steps to reproduce

Remember: Most issues are environment-related. The app works when both the backend (port 8000) and frontend (port 3000) are running correctly! 
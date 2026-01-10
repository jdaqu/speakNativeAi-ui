const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen, shell, protocol } = require('electron')
const path = require('path')
const isTest = process.env.NODE_ENV === 'test'
// Don't use app.isPackaged during module initialization - it's only available after app is ready
const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
const DEV_SERVER_PORT = process.env.DEV_SERVER_PORT || '3000'

let mainWindow
let quickAccessWindow
let tray

// Keep a global reference of the window object
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../src/app/favicon.ico'),
    title: 'SpeakNative AI',
    show: false // Don't show initially
  })

  // Load the app
  console.log('isDev:', isDev)
  console.log('isTest:', isTest)
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('isPackaged:', app.isPackaged)

  // In test mode, use dev server (same as dev mode)
  if (isDev || isTest) {
    const devServerUrl = `http://localhost:${DEV_SERVER_PORT}`
    console.log('Loading from dev server:', devServerUrl)
    mainWindow.loadURL(devServerUrl)
    // Open DevTools in dev mode but not test mode
    if (isDev && !isTest) {
      mainWindow.webContents.openDevTools()
    }
  } else {
    console.log('Loading from file:', path.join(__dirname, '../out/index.html'))
    // Use loadURL with file protocol for better path resolution
    const filePath = path.join(__dirname, '../out/index.html')
    mainWindow.loadURL(`file://${filePath}`)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Hide window on close instead of quitting (for system tray)
  // In test mode, allow windows to close normally
  mainWindow.on('close', (event) => {
    if (!app.isQuiting && !isTest) {
      event.preventDefault()
      mainWindow.hide()
    }
  })
}

// Create the quick access popup window
const createQuickAccessWindow = () => {
  // Get cursor position
  const { x, y } = screen.getCursorScreenPoint()
  const display = screen.getDisplayNearestPoint({ x, y })

  quickAccessWindow = new BrowserWindow({
    width: 500,
    height: 600,
    x: Math.max(0, x - 250), // Center on cursor
    y: Math.max(0, y - 100), // Slightly above cursor
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  })

  // Load the quick access page
  if (isDev || isTest) {
    const devServerUrl = `http://localhost:${DEV_SERVER_PORT}/quick-access`
    quickAccessWindow.loadURL(devServerUrl)
  } else {
    const quickAccessPath = path.join(__dirname, '../out/quick-access/index.html')
    quickAccessWindow.loadURL(`file://${quickAccessPath}`)
  }

  quickAccessWindow.on('closed', () => {
    quickAccessWindow = null
  })

  // Hide window when losing focus
  quickAccessWindow.on('blur', () => {
    if (quickAccessWindow) {
      quickAccessWindow.hide()
    }
  })

  // Show window
  quickAccessWindow.once('ready-to-show', () => {
    quickAccessWindow.show()
    quickAccessWindow.focus()
  })
}

// Create system tray
const createTray = () => {
  // Skip tray creation for now to avoid icon loading issues
  console.log('Skipping tray creation for development')
  return
  
  // Use a simple tray icon - create a 16x16 pixel icon or use built-in
  const iconPath = path.join(__dirname, '../src/app/favicon.ico')
  
  // Check if icon exists, otherwise use a default
  try {
    tray = new Tray(iconPath)
  } catch (error) {
    console.log('Could not load tray icon, using default')
    // Create a simple 16x16 pixel icon programmatically or skip tray for now
    return
  }
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quick Access (Cmd+Shift+S)',
      click: () => {
        showQuickAccess()
      }
    },
    {
      label: 'Show SpeakNative AI',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
        } else {
          createMainWindow()
        }
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('SpeakNative AI - English Learning Assistant')
  tray.setContextMenu(contextMenu)
  
  // Double-click to show quick access
  tray.on('double-click', () => {
    showQuickAccess()
  })
}

// Show quick access window
const showQuickAccess = () => {
  if (quickAccessWindow) {
    quickAccessWindow.show()
    quickAccessWindow.focus()
  } else {
    createQuickAccessWindow()
  }
}

// Register custom protocol for OAuth callback
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('speaknativeai', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('speaknativeai')
}

// Handle OAuth callback from deep link
const handleOAuthCallback = (url) => {
  console.log('Received OAuth callback URL:', url)
  
  // Parse the URL to get the access token
  const urlObj = new URL(url)
  const params = new URLSearchParams(urlObj.search)
  const accessToken = params.get('access_token')
  const error = params.get('error')
  
  console.log('Parsed access token:', accessToken ? 'Present' : 'Missing')
  console.log('Parsed error:', error)
  
  if (accessToken) {
    // Send token to all windows
    if (mainWindow) {
      mainWindow.webContents.send('oauth-callback', { success: true, accessToken })
      mainWindow.show()
      mainWindow.focus()
    }
    if (quickAccessWindow) {
      quickAccessWindow.webContents.send('oauth-callback', { success: true, accessToken })
    }
  } else {
    // Handle error
    const errorMessage = params.get('message') || 'OAuth authentication failed'
    if (mainWindow) {
      mainWindow.webContents.send('oauth-callback', { success: false, error: errorMessage })
      mainWindow.show()
      mainWindow.focus()
    }
  }
}

// Handle protocol for macOS
app.on('open-url', (event, url) => {
  event.preventDefault()
  handleOAuthCallback(url)
})

// Handle protocol for Windows/Linux
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine) => {
    // Someone tried to run a second instance, we should focus our window instead.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    
    // Handle deep link on Windows/Linux
    const url = commandLine.find((arg) => arg.startsWith('speaknativeai://'))
    if (url) {
      handleOAuthCallback(url)
    }
  })
}

// App event handlers
app.whenReady().then(() => {
  createMainWindow()
  createTray()

  // Register global shortcuts
  // Using Cmd+Shift+S (easy to remember: "SpeakNative Shortcut")
  const shortcut = process.platform === 'darwin' ? 'Cmd+Shift+S' : 'Ctrl+Shift+S'
  
  const registered = globalShortcut.register(shortcut, () => {
    showQuickAccess()
  })

  if (!registered) {
    console.log('Failed to register global shortcut')
  }

  // Handle app activation (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Clean up global shortcuts
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// Shared storage for auth token across windows
let sharedAuthToken = null

// IPC handlers for communication with renderer
ipcMain.handle('hide-quick-access', () => {
  if (quickAccessWindow) {
    quickAccessWindow.hide()
  }
})

ipcMain.handle('show-main-window', () => {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  } else {
    createMainWindow()
  }
})

ipcMain.handle('get-platform', () => {
  return process.platform
})

ipcMain.handle('get-shortcut', () => {
  return process.platform === 'darwin' ? 'Cmd+Shift+S' : 'Ctrl+Shift+S'
})

// Shared token storage handlers
ipcMain.handle('get-shared-token', () => {
  return sharedAuthToken
})

ipcMain.handle('set-shared-token', (event, token) => {
  sharedAuthToken = token
  return true
})

ipcMain.handle('remove-shared-token', () => {
  sharedAuthToken = null
  return true
})

// OAuth handlers
ipcMain.handle('open-google-login', async (event, apiBaseUrl) => {
  // Open Google OAuth login in default browser with platform=electron parameter
  const loginUrl = `${apiBaseUrl}/v1/auth/google/login?platform=electron`
  console.log('Opening Google OAuth URL:', loginUrl)
  await shell.openExternal(loginUrl)
  return true
}) 
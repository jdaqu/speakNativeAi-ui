const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

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
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('isPackaged:', app.isPackaged)
  
  if (isDev) {
    console.log('Loading from dev server: http://localhost:3000')
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    console.log('Loading from file:', path.join(__dirname, '../out/index.html'))
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'))

    // Open DevTools in production builds to help debug
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Hide window on close instead of quitting (for system tray)
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
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
  if (isDev) {
    quickAccessWindow.loadURL('http://localhost:3000/quick-access')
  } else {
    quickAccessWindow.loadFile(path.join(__dirname, '../out/quick-access/index.html'))
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
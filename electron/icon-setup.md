# Electron App Icon Setup

To properly set up the app icon for SpeakNative AI:

## Required Icon Files

1. **System Tray Icon** (16x16, 32x32 pixels)
   - Create a simple icon file and place it in `public/tray-icon.png`
   - This should be a small, recognizable icon for the system tray

2. **App Icon** (for the main window)
   - Use the existing `public/favicon.ico` or create a larger version
   - Should be 256x256 pixels for best quality

## Current Setup

The main.js file references:
- `../public/favicon.ico` for the main window
- `../public/favicon.ico` for the system tray (needs to be replaced with tray-icon.png)

## To Fix

1. Create or find a 16x16 pixel PNG icon for the system tray
2. Save it as `public/tray-icon.png`
3. Update the tray icon path in `electron/main.js`

## Icon Guidelines

- Use a simple, recognizable design
- Should work well at small sizes (16x16)
- Consider using a brain or language-related icon
- PNG format recommended for transparency support 
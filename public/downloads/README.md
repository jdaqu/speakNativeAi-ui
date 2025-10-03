# Desktop App Downloads

The desktop app downloads are currently being set up. 

## Current Status
- GitHub releases are not yet available
- The app will fall back to these local download links when GitHub API is unavailable

## Next Steps
1. Create GitHub repository: `jdaqu/speakNativeAi-ui`
2. Build and upload .dmg files to GitHub releases
3. Update the app to use GitHub releases as primary source

## Building the Desktop App
To build the desktop app locally:

```bash
# Build for Mac ARM64 (Apple Silicon)
npm run electron:build:arm64

# Build for Mac Intel
npm run electron:build:intel

# Build both architectures
npm run electron:build
```

The built .dmg files will be in the `dist/` directory and can be uploaded to GitHub releases.

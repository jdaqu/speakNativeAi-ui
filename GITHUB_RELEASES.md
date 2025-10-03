# GitHub Releases Setup Guide

This document explains how to set up and manage GitHub releases for the SpeakNative AI desktop application.

## Overview

The SpeakNative AI desktop app uses GitHub releases to distribute .dmg files for macOS (both Intel and Apple Silicon architectures). The web application automatically fetches the latest release information from GitHub's API and provides download links to users.

## Architecture

### Release Management Flow
```
1. Build Desktop App → 2. Create GitHub Release → 3. Web App Fetches Release → 4. Users Download
```

### File Structure
```
dist/
├── SpeakNative AI-0.1.0.dmg          # Intel Mac version
├── SpeakNative AI-0.1.0-arm64.dmg    # Apple Silicon version
└── *.blockmap                        # Electron builder metadata
```

## Setup Process

### 1. Repository Configuration

The GitHub repository must be **public** for the API to work without authentication.

```bash
# Make repository public (if it was private)
gh repo edit jdaqu/speakNativeAi-ui --visibility public --accept-visibility-change-consequences
```

### 2. Building the Desktop App

Build both Intel and Apple Silicon versions:

```bash
# Build for both architectures
npm run electron:build

# Or build individually
npm run electron:build:intel    # Intel Mac
npm run electron:build:arm64    # Apple Silicon
```

This creates .dmg files in the `dist/` directory.

### 3. Creating a Release

Use GitHub CLI to create releases:

```bash
# Create a new release with both .dmg files
gh release create v0.1.0 \
  "dist/SpeakNative AI-0.1.0.dmg" \
  "dist/SpeakNative AI-0.1.0-arm64.dmg" \
  --title "SpeakNative AI Desktop v0.1.0" \
  --notes "## Desktop App Release v0.1.0

### Downloads
- **Mac (Apple Silicon)**: Download the ARM64 version for M1/M2 Macs
- **Mac (Intel)**: Download the Intel version for Intel-based Macs

### Features
- Global hotkey access (Cmd+Shift+S)
- Quick Fix, Translate & Define popup
- Works offline for cached content
- System tray integration
- Auto-updates for latest features
- Native OS integration

### Installation
1. Download the appropriate version for your Mac
2. Open the .dmg file
3. Drag SpeakNative AI to your Applications folder
4. Launch the app and sign in with your account"
```

## API Integration

### GitHub API Endpoints

The web application uses these GitHub API endpoints:

- **Latest Release**: `https://api.github.com/repos/jdaqu/speakNativeAi-ui/releases/latest`
- **All Releases**: `https://api.github.com/repos/jdaqu/speakNativeAi-ui/releases`

### Code Implementation

The release fetching is handled in `src/lib/github-releases.ts`:

```typescript
// Fetch latest release from GitHub API
export async function getLatestReleaseDownloads(): Promise<DownloadUrls | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`
    )
    
    if (!response.ok) {
      console.warn('Failed to fetch latest release:', response.status)
      return null
    }
    
    const release: GitHubRelease = await response.json()
    
    // Find the appropriate assets
    const arm64Asset = release.assets.find(asset => 
      asset.name.includes('arm64') && asset.name.endsWith('.dmg')
    )
    
    const intelAsset = release.assets.find(asset => 
      (asset.name.includes('x64') || asset.name.includes('intel')) && 
      asset.name.endsWith('.dmg') && 
      !asset.name.includes('arm64')
    )
    
    return {
      macArm64: arm64Asset.browser_download_url,
      macIntel: intelAsset.browser_download_url,
      version: release.tag_name
    }
  } catch (error) {
    console.warn('Error fetching GitHub release:', error)
    return null
  }
}
```

### Fallback Mechanism

If GitHub API fails, the app falls back to local download URLs:

```typescript
export function getFallbackDownloadUrls(): DownloadUrls {
  return {
    macArm64: '/downloads/SpeakNativeAI-mac-arm64.dmg',
    macIntel: '/downloads/SpeakNativeAI-mac-intel.dmg',
    version: 'latest'
  }
}
```

## Troubleshooting

### Common Issues

#### 1. 404 Error from GitHub API
**Problem**: `https://api.github.com/repos/jdaqu/speakNativeAi-ui/releases/latest` returns 404

**Solutions**:
- Ensure repository is public: `gh repo edit jdaqu/speakNativeAi-ui --visibility public`
- Check if releases exist: `gh release list`
- Verify repository name is correct

#### 2. No Assets Found in Release
**Problem**: Release exists but no .dmg files are found

**Solutions**:
- Check asset names match expected patterns:
  - ARM64: contains `arm64` and ends with `.dmg`
  - Intel: contains `x64` or `intel`, ends with `.dmg`, doesn't contain `arm64`
- Verify .dmg files were uploaded successfully

#### 3. CORS Issues
**Problem**: Browser blocks GitHub API requests

**Solutions**:
- GitHub API supports CORS for public repositories
- Check browser console for specific error messages
- Ensure you're not making requests from `file://` protocol

### Debugging Commands

```bash
# Check repository status
gh repo view jdaqu/speakNativeAi-ui

# List all releases
gh release list

# View specific release
gh release view v0.1.0

# Test GitHub API directly
curl -s "https://api.github.com/repos/jdaqu/speakNativeAi-ui/releases/latest" | jq '.tag_name, .assets[].name'
```

## Release Workflow

### For New Versions

1. **Update Version**:
   ```bash
   # Update package.json version
   npm version patch  # or minor, major
   ```

2. **Build Desktop App**:
   ```bash
   npm run electron:build
   ```

3. **Create Release**:
   ```bash
   gh release create v$(npm pkg get version | tr -d '"') \
     "dist/SpeakNative AI-$(npm pkg get version | tr -d '"').dmg" \
     "dist/SpeakNative AI-$(npm pkg get version | tr -d '"')-arm64.dmg" \
     --title "SpeakNative AI Desktop v$(npm pkg get version | tr -d '"')" \
     --notes "Release notes here..."
   ```

4. **Deploy Web App**:
   ```bash
   # Deploy to Vercel (or your hosting platform)
   vercel --prod
   ```

### Automated Release (Future Enhancement)

Consider setting up GitHub Actions for automated releases:

```yaml
# .github/workflows/release.yml
name: Release Desktop App
on:
  push:
    tags:
      - 'v*'
jobs:
  release:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run electron:build
      - uses: softprops/action-gh-release@v1
        with:
          files: dist/*.dmg
```

## File Naming Conventions

### Desktop App Files
- **Intel Mac**: `SpeakNative AI-{version}.dmg`
- **Apple Silicon**: `SpeakNative AI-{version}-arm64.dmg`

### Version Tags
- Use semantic versioning: `v1.0.0`, `v1.0.1`, `v1.1.0`
- Always prefix with `v`
- Match package.json version

## Security Considerations

- Repository is public, so anyone can download releases
- No authentication required for public repositories
- Consider code signing for production releases
- Monitor download statistics in GitHub releases

## Monitoring

### GitHub Release Metrics
- View download counts in GitHub UI
- Monitor release page visits
- Track user feedback and issues

### Application Metrics
- Monitor GitHub API success/failure rates
- Track fallback usage (indicates API issues)
- Log download attempts and errors

---

## Quick Reference

### Essential Commands
```bash
# Build desktop app
npm run electron:build

# Create release
gh release create v0.1.0 "dist/*.dmg" --title "Release v0.1.0"

# Check releases
gh release list

# Test API
curl -s "https://api.github.com/repos/jdaqu/speakNativeAi-ui/releases/latest"
```

### File Locations
- **Source Code**: `src/lib/github-releases.ts`
- **Built Files**: `dist/*.dmg`
- **Fallback Files**: `public/downloads/`
- **Documentation**: `GITHUB_RELEASES.md`

### URLs
- **Repository**: https://github.com/jdaqu/speakNativeAi-ui
- **Releases**: https://github.com/jdaqu/speakNativeAi-ui/releases
- **Latest Release**: https://github.com/jdaqu/speakNativeAi-ui/releases/latest

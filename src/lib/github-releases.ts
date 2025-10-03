interface GitHubRelease {
  tag_name: string
  name: string
  assets: Array<{
    name: string
    browser_download_url: string
    size: number
  }>
}

export interface DownloadUrls {
  macArm64: string
  macIntel: string
  version: string
}

const GITHUB_OWNER = 'jdaqu'
const GITHUB_REPO = 'speakNativeAi-ui'

/**
 * Get the latest release download URLs from GitHub
 */
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
    console.log('Available assets:', release.assets.map(a => a.name))
    
    const arm64Asset = release.assets.find(asset => 
      asset.name.includes('arm64') && asset.name.endsWith('.dmg')
    )
    
    const intelAsset = release.assets.find(asset => 
      asset.name.endsWith('.dmg') && 
      !asset.name.includes('arm64')
    )
    
    console.log('Found assets:', { 
      arm64Asset: arm64Asset?.name, 
      intelAsset: intelAsset?.name,
      arm64Url: arm64Asset?.browser_download_url,
      intelUrl: intelAsset?.browser_download_url
    })
    
    if (!arm64Asset || !intelAsset) {
      console.warn('Could not find required assets in release:', release.assets)
      return null
    }
    
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

/**
 * Get fallback download URLs (for when GitHub API fails)
 */
export function getFallbackDownloadUrls(): DownloadUrls {
  return {
    macArm64: '/downloads/SpeakNativeAI-mac-arm64.dmg',
    macIntel: '/downloads/SpeakNativeAI-mac-intel.dmg',
    version: 'latest'
  }
}

/**
 * Get download URLs with fallback
 */
export async function getDownloadUrls(): Promise<DownloadUrls> {
  const releaseUrls = await getLatestReleaseDownloads()
  return releaseUrls || getFallbackDownloadUrls()
}

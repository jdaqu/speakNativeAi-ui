const { notarize } = require('@electron/notarize');
const path = require('path');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 30000; // 30 seconds

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function notarizeWithRetry(options, attempt = 1) {
  try {
    console.log(`Notarization attempt ${attempt} of ${MAX_RETRIES}...`);
    await notarize(options);
    return true;
  } catch (error) {
    const isNetworkError = error.message && (
      error.message.includes('offline') ||
      error.message.includes('network') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('NSURLErrorDomain')
    );

    if (isNetworkError && attempt < MAX_RETRIES) {
      console.log(`Network error detected. Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
      console.log(`Error was: ${error.message}`);
      await sleep(RETRY_DELAY_MS);
      return notarizeWithRetry(options, attempt + 1);
    }

    throw error;
  }
}

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  // Only notarize on macOS builds
  if (electronPlatformName !== 'darwin') {
    console.log('Skipping notarization - not a macOS build');
    return;
  }

  // Check for required environment variables
  if (!process.env.APPLE_ID || !process.env.APPLE_APP_SPECIFIC_PASSWORD) {
    console.log('Skipping notarization - APPLE_ID or APPLE_APP_SPECIFIC_PASSWORD not set');
    console.log('This is expected for local builds. GitHub Actions will set these.');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`Notarizing ${appName} at ${appPath}...`);
  console.log(`Apple ID: ${process.env.APPLE_ID}`);
  console.log(`Team ID: ${process.env.APPLE_TEAM_ID}`);

  try {
    await notarizeWithRetry({
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });

    console.log('Notarization successful!');
  } catch (error) {
    console.error('Notarization failed after all retries:', error);
    throw error;
  }
};

const { notarize } = require('@electron/notarize');
const path = require('path');

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

  try {
    await notarize({
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });

    console.log('Notarization successful!');
  } catch (error) {
    console.error('Notarization failed:', error);
    throw error;
  }
};

const path = require('path');
const fs = require('fs');

// Dynamic import for ES Module compatibility
async function getNotarize() {
  const { notarize } = await import('@electron/notarize');
  return notarize;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 30000; // 30 seconds

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logDebugInfo(appPath, context) {
  console.log('\n========== NOTARIZATION DEBUG INFO ==========');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`App Path: ${appPath}`);
  console.log(`App Exists: ${fs.existsSync(appPath)}`);

  // Log environment variables (masked for security)
  console.log(`APPLE_ID: ${process.env.APPLE_ID || 'NOT SET'}`);
  console.log(`APPLE_TEAM_ID: ${process.env.APPLE_TEAM_ID || 'NOT SET'}`);
  console.log(`APPLE_APP_SPECIFIC_PASSWORD: ${process.env.APPLE_APP_SPECIFIC_PASSWORD ? '****' + process.env.APPLE_APP_SPECIFIC_PASSWORD.slice(-4) : 'NOT SET'}`);

  // Log app bundle info
  const infoPlistPath = path.join(appPath, 'Contents', 'Info.plist');
  if (fs.existsSync(infoPlistPath)) {
    console.log(`Info.plist exists: true`);
  } else {
    console.log(`Info.plist exists: false - THIS IS A PROBLEM`);
  }

  // Log context info
  if (context && context.packager) {
    console.log(`App ID: ${context.packager.appInfo?.id || 'unknown'}`);
    console.log(`App Name: ${context.packager.appInfo?.productFilename || 'unknown'}`);
  }

  console.log('==============================================\n');
}

function categorizeError(error) {
  const msg = error.message || String(error);

  if (msg.includes('offline') || msg.includes('NSURLErrorDomain') ||
      msg.includes('ETIMEDOUT') || msg.includes('ECONNRESET') ||
      msg.includes('network')) {
    return { type: 'NETWORK', retryable: true };
  }

  if (msg.includes('Invalid username and password') ||
      msg.includes('authentication') || msg.includes('401')) {
    return { type: 'AUTH_FAILED', retryable: false };
  }

  if (msg.includes('app-specific password')) {
    return { type: 'APP_SPECIFIC_PASSWORD_INVALID', retryable: false };
  }

  if (msg.includes('team') || msg.includes('Team ID')) {
    return { type: 'TEAM_ID_INVALID', retryable: false };
  }

  if (msg.includes('not signed') || msg.includes('signature')) {
    return { type: 'SIGNING_ISSUE', retryable: false };
  }

  if (msg.includes('Invalid') || msg.includes('rejected')) {
    return { type: 'APPLE_REJECTED', retryable: false };
  }

  return { type: 'UNKNOWN', retryable: true };
}

async function notarizeWithRetry(options, context, attempt = 1) {
  try {
    console.log(`\nNotarization attempt ${attempt} of ${MAX_RETRIES}...`);
    const notarize = await getNotarize();
    await notarize(options);
    return true;
  } catch (error) {
    const errorInfo = categorizeError(error);

    console.error(`\n========== NOTARIZATION ERROR ==========`);
    console.error(`Attempt: ${attempt} of ${MAX_RETRIES}`);
    console.error(`Error Type: ${errorInfo.type}`);
    console.error(`Retryable: ${errorInfo.retryable}`);
    console.error(`Error Message: ${error.message}`);
    console.error(`Full Error:`, error);
    console.error(`==========================================\n`);

    if (errorInfo.retryable && attempt < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
      await sleep(RETRY_DELAY_MS);
      return notarizeWithRetry(options, context, attempt + 1);
    }

    // Provide helpful error messages
    switch (errorInfo.type) {
      case 'AUTH_FAILED':
        console.error('HINT: Check that APPLE_ID is your correct Apple ID email');
        break;
      case 'APP_SPECIFIC_PASSWORD_INVALID':
        console.error('HINT: The app-specific password may be invalid or revoked. Generate a new one at appleid.apple.com');
        break;
      case 'TEAM_ID_INVALID':
        console.error('HINT: Check that APPLE_TEAM_ID matches your team ID at developer.apple.com/account');
        break;
      case 'SIGNING_ISSUE':
        console.error('HINT: The app may not be properly signed. Check the code signing step.');
        break;
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
  const missingVars = [];
  if (!process.env.APPLE_ID) missingVars.push('APPLE_ID');
  if (!process.env.APPLE_APP_SPECIFIC_PASSWORD) missingVars.push('APPLE_APP_SPECIFIC_PASSWORD');
  if (!process.env.APPLE_TEAM_ID) missingVars.push('APPLE_TEAM_ID');

  if (missingVars.length > 0) {
    console.log(`Skipping notarization - Missing environment variables: ${missingVars.join(', ')}`);
    console.log('This is expected for local builds. GitHub Actions will set these.');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  // Log detailed debug info
  logDebugInfo(appPath, context);

  try {
    await notarizeWithRetry({
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    }, context);

    console.log('\n✅ Notarization successful!\n');
  } catch (error) {
    console.error('\n❌ Notarization failed after all attempts');
    throw error;
  }
};

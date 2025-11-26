# Google Analytics 4 Implementation Guide

This document outlines the Google Analytics 4 (GA4) implementation for SpeakNative AI, including setup instructions and what's tracked on the frontend vs backend.

## Overview

Google Analytics 4 has been integrated to track user behavior, page views, and key events. The implementation is designed to work seamlessly in both web and Electron modes, with conditional loading to ensure analytics only runs in web mode.

## What Google Analytics Provides

### Basic Metrics (Automatic)
- **Page Views**: All page navigation is automatically tracked
- **User Sessions**: Session duration, bounce rate, and engagement
- **User Demographics**: Country, language, device type (desktop/mobile)
- **Traffic Sources**: Where users are coming from
- **Real-time Data**: See active users in real-time

### Custom Events (Implemented)
- **User Registration**: Tracks when users create accounts (email or Google)
- **User Login**: Tracks login events (email or Google OAuth)
- **Feature Usage**: Tracks usage of dashboard features (Fix, Translate, Define)
- **Email Verification**: Tracks successful and failed email verifications

## Frontend Implementation

### Files Modified

1. **`src/lib/analytics.ts`** (New)
   - Analytics utility module with event tracking functions
   - Handles conditional loading (skips in Electron mode)
   - Provides helper functions for common events

2. **`src/components/GoogleAnalytics.tsx`** (New)
   - Client component that conditionally loads GA4
   - Only loads in web mode, not in Electron builds
   - Uses `@next/third-parties` package for optimal performance

3. **`src/app/layout.tsx`**
   - Added `GoogleAnalyticsWrapper` component to root layout
   - GA4 script loads automatically on all pages

4. **`src/app/register/page.tsx`**
   - Tracks `user_registered` event after successful registration
   - Tracks registration method (email or Google)

5. **`src/lib/auth-context.tsx`**
   - Tracks `user_login` event after successful login
   - Tracks login method (email or Google OAuth)

6. **`src/app/dashboard/components/Fix.tsx`**
   - Tracks `feature_used` event when Fix feature is used

7. **`src/app/dashboard/components/Translate.tsx`**
   - Tracks `feature_used` event when Translate feature is used

8. **`src/app/dashboard/components/Define.tsx`**
   - Tracks `feature_used` event when Define feature is used

9. **`src/app/verify-email/page.tsx`**
   - Tracks `email_verified` event with success/error status

### Event Structure

#### User Registration
```javascript
{
  event: 'user_registered',
  registration_method: 'email' | 'google'
}
```

#### User Login
```javascript
{
  event: 'user_login',
  login_method: 'email' | 'google'
}
```

#### Feature Usage
```javascript
{
  event: 'feature_used',
  feature_name: 'fix' | 'translate' | 'define'
}
```

#### Email Verification
```javascript
{
  event: 'email_verified',
  verification_status: 'success' | 'error'
}
```

## Backend Implementation

### Current Status
**No backend changes are required** for the basic GA4 implementation. All tracking happens client-side through the browser.

### Future Enhancements (Optional)
If you want server-side analytics in the future, you could:
- Log events to your database for custom analytics
- Send events to GA4 Measurement Protocol API
- Create custom analytics endpoints
- Track server-side events (API errors, performance metrics, etc.)

## Setup Instructions

### 1. Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Admin" (gear icon) in the bottom left
4. Click "Create Account"
5. Fill in account details:
   - Account name: "SpeakNative AI"
   - Configure data sharing settings as desired
6. Click "Next"

### 2. Create GA4 Property

1. Click "Create Property"
2. Enter property name: "SpeakNative AI Web"
3. Select reporting time zone
4. Select currency
5. Click "Next"
6. Fill in business information (optional)
7. Click "Create"

### 3. Get Measurement ID

1. In your new property, go to "Admin" → "Data Streams"
2. Click "Add stream" → "Web"
3. Enter website URL: Your production URL (e.g., `https://yourdomain.com`)
4. Enter stream name: "SpeakNative AI Web"
5. Click "Create stream"
6. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### 4. Configure Environment Variable

Add the Measurement ID to your environment variables:

**For local development:**
Create or update `.env.local`:
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**For production (Vercel/Railway/etc.):**
Add the environment variable in your hosting platform's dashboard:
- Variable name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Variable value: `G-XXXXXXXXXX` (your actual Measurement ID)

### 5. Verify Installation

1. Start your development server: `npm run dev`
2. Open your app in a browser
3. Open browser DevTools → Network tab
4. Filter by "gtag" or "collect"
5. You should see requests to `google-analytics.com`
6. Go to GA4 dashboard → Reports → Realtime
7. You should see your visit appear within 30 seconds

## Testing

### Test in Web Mode
1. Run `npm run dev`
2. Navigate through the app
3. Register a new account → Check GA4 for `user_registered` event
4. Login → Check GA4 for `user_login` event
5. Use dashboard features → Check GA4 for `feature_used` events
6. Verify email → Check GA4 for `email_verified` event

### Test Electron Mode
1. Build Electron app: `npm run electron:build`
2. Open the Electron app
3. Check that GA4 does NOT load (no network requests to google-analytics.com)
4. This is expected behavior - analytics should not run in Electron

### Verify Events in GA4
1. Go to GA4 dashboard
2. Navigate to "Reports" → "Engagement" → "Events"
3. You should see all custom events:
   - `user_registered`
   - `user_login`
   - `feature_used`
   - `email_verified`
   - `page_view` (automatic)

## Privacy Considerations

### Current Implementation
- Analytics only runs in web mode (not Electron)
- No personally identifiable information (PII) is sent to GA4
- User emails are NOT tracked
- All tracking is client-side only

### Future Enhancements (Optional)
- Add cookie consent banner for GDPR compliance
- Implement IP anonymization
- Add opt-out mechanism for users
- Configure data retention settings in GA4

## Troubleshooting

### GA4 Not Loading
1. Check that `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly
2. Verify the Measurement ID format: `G-XXXXXXXXXX`
3. Check browser console for errors
4. Ensure you're in web mode (not Electron)

### Events Not Appearing
1. Check browser console for errors
2. Verify events are being called (add `console.log` in analytics.ts)
3. Wait 24-48 hours for data to appear in standard reports
4. Check Real-time reports for immediate verification
5. Ensure you're not using an ad blocker (may block GA4)

### Electron App Loading GA4
1. This should NOT happen - GA4 is conditionally disabled in Electron
2. Check `GoogleAnalyticsWrapper` component logic
3. Verify Electron detection is working correctly

## Analytics Dashboard Access

To view your analytics:
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your "SpeakNative AI Web" property
3. Navigate to "Reports" for insights:
   - **Realtime**: See current active users
   - **Acquisition**: Where users come from
   - **Engagement**: How users interact with your app
   - **Events**: Custom events we're tracking

## Key Metrics to Monitor

### User Acquisition
- New vs returning users
- Registration rate
- Login rate
- Email verification completion rate

### Feature Usage
- Most used features (Fix, Translate, Define)
- Feature usage trends over time
- User engagement with features

### User Behavior
- Page views per session
- Average session duration
- Bounce rate
- User flow through the app

## Next Steps

1. **Set up the Measurement ID** in your environment variables
2. **Test the implementation** in development
3. **Deploy to production** and verify events are tracking
4. **Monitor analytics** regularly to understand user behavior
5. **Create custom reports** in GA4 for specific insights
6. **Set up alerts** for important metrics (e.g., drop in registrations)

## Support

For issues or questions:
- Check GA4 documentation: https://support.google.com/analytics/answer/9304153
- Review Next.js third-parties docs: https://nextjs.org/docs/app/api-reference/components/third-parties


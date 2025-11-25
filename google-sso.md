 Frontend Instructions: Google SSO Integration

  Overview

  The backend now supports Google OAuth authentication. Users can sign up/login with Google in addition to the existing email/password method.

  Backend Endpoints Available

  1. Initiate Google Login:
  GET http://localhost:8000/api/v1/auth/google/login
  - Redirects user to Google's consent screen
  - User grants permission
  - Google redirects back to backend

  2. Callback (Backend handles automatically):
  GET http://localhost:8000/api/v1/auth/google/callback
  - Backend receives Google user info
  - Creates user if new, or logs in if existing
  - Redirects to frontend with tokens:
  http://localhost:3000/auth/callback?access_token=JWT_TOKEN&token_type=bearer

  ---
  Frontend Implementation Tasks

  1. Add "Sign in with Google" Button

  On your login/register page, add a Google sign-in button:

  // LoginPage.tsx
  <button onClick={() => handleGoogleLogin()}>
    <GoogleIcon /> Sign in with Google
  </button>

  const handleGoogleLogin = () => {
    // Simply redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:8000/api/v1/auth/google/login';
  };

  2. Create OAuth Callback Handler

  Create a new page/route to handle the callback:

  // pages/auth/callback.tsx or routes/auth/callback
  import { useEffect } from 'react';
  import { useNavigate, useSearchParams } from 'react-router-dom';

  export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
      // Extract token from URL
      const accessToken = searchParams.get('access_token');
      const tokenType = searchParams.get('token_type');

      if (accessToken) {
        // Store token (same as regular login)
        localStorage.setItem('access_token', accessToken);

        // Optional: Fetch user info
        // GET /api/v1/auth/me with Bearer token

        // Redirect to dashboard/home
        navigate('/dashboard');
      } else {
        // Handle error
        navigate('/login?error=oauth_failed');
      }
    }, [searchParams, navigate]);

    return <div>Completing sign in...</div>;
  }

  3. Add Route for Callback

  // App.tsx or routes configuration
  <Route path="/auth/callback" element={<OAuthCallback />} />
  <Route path="/auth/error" element={<OAuthError />} />  {/* Optional */}

  4. Optional: Error Handling Page

  // pages/auth/error.tsx
  export default function OAuthError() {
    const [searchParams] = useSearchParams();
    const message = searchParams.get('message') || 'Authentication failed';

    return (
      <div>
        <h1>Sign In Failed</h1>
        <p>{message}</p>
        <Link to="/login">Try Again</Link>
      </div>
    );
  }

  ---
  Key Points

  - Same JWT tokens: Google OAuth returns the same format as email/password login
  - Same API calls: After authentication, use the same protected endpoints
  - Refresh tokens: Google OAuth also sets the HttpOnly refresh cookie automatically
  - User data: Google users have oauth_provider: "google" and profile_picture_url populated

  Testing

  1. Click "Sign in with Google" button
  2. Select Google account
  3. Grant permissions
  4. Should redirect to /auth/callback?access_token=...
  5. Token stored, user logged in, redirected to dashboard

  ---
  Environment Variables (Frontend)

  Add to your frontend .env:
  VITE_API_URL=http://localhost:8000
  # or REACT_APP_API_URL for Create React App

  Use in Google button:
  const API_URL = import.meta.env.VITE_API_URL; // Vite
  // const API_URL = process.env.REACT_APP_API_URL; // CRA

  window.location.href = `${API_URL}/api/v1/auth/google/login`;

  ---
  Optional: Display User Profile Picture

  Google users have a profile picture URL:

  // After fetching user from /api/v1/auth/me
  {user.profile_picture_url && (
    <img src={user.profile_picture_url} alt="Profile" />
  )}
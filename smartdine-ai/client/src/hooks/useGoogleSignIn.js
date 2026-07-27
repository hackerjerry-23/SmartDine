import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Loads the Google Identity Services script once and renders the official
 * sign-in button into #google-signin-button (present on the Login page).
 * On success, exchanges the Google idToken for our own JWT via
 * POST /api/auth/google (see AuthContext.loginWithGoogle).
 */
export function useGoogleSignIn() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return; // not configured - Google button simply won't render

    const scriptId = 'google-identity-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = scriptId;
      script.async = true;
      script.onload = init;
      document.body.appendChild(script);
    } else {
      init();
    }

    function init() {
      const target = document.getElementById('google-signin-button');
      if (!target || !window.google) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          await loginWithGoogle(response.credential);
          navigate('/');
        },
      });
      window.google.accounts.id.renderButton(target, { theme: 'outline', size: 'large', width: 320 });
    }
  }, []);
}

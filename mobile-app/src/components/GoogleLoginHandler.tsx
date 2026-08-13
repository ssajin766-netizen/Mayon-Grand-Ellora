import React, { useEffect, useRef } from 'react';
import { useWebView } from '../context/WebViewContext';
import { useAppSelector } from '../store/hooks';

// This component triggers the Google OAuth flow exactly once.
// It watches the `googleLoginPending` flag in Redux. When the flag
// becomes true it navigates to `/auth/google` inside the shared WebView.
// A `started` ref ensures the navigation runs only on the first activation
// (preventing the infinite‑loop bug).
const GoogleLoginHandler: React.FC = () => {
  const pending = useAppSelector(state => state.auth.googleLoginPending);
  const { navigate } = useWebView();
  const started = useRef(false);

  useEffect(() => {
    if (!pending) {
      // Reset so a future login can start again.
      started.current = false;
      return;
    }
    if (started.current) return;
    started.current = true;
    navigate('/auth/google');
  }, [pending, navigate]);

  return null;
};

export default GoogleLoginHandler;

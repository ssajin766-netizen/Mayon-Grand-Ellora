import { resetAllState } from '../store';
import { AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { clearAuthState } from '../services/authPersistence';
import { clearMobileAuthToken } from '../services/mobileAuthToken';

/**
 * Clears native authentication state.
 *
 * IMPORTANT:
 * The Passport session is owned by the React Native WebView cookie jar.
 * Server logout MUST therefore be initiated by navigating the WebView to
 * `/logout`; do not use Axios to call the server logout endpoint.
 * WebViewComponent performs that navigation and calls this cleanup after
 * the server redirects to `/login`.
 *
 * This helper is retained for any future native-only cleanup use.
 */
export const performLocalLogout = async (
  dispatch: AppDispatch
): Promise<void> => {
  try {
    await clearAuthState();
  } catch (error) {
    console.error('FAILED TO CLEAR PERSISTED AUTH:', error);
  }

  try {
    await clearMobileAuthToken();
  } catch (error) {
    console.error('FAILED TO CLEAR MOBILE AUTH TOKEN:', error);
  }

  try {
    dispatch(resetAllState());
  } catch (error) {
    console.error('REDUX RESET FAILED:', error);
  }

  dispatch(logout());
};

// Backward-compatible alias. Prefer triggering server logout through the
// WebView and allowing WebViewComponent to perform the final cleanup.
export const performLogout = performLocalLogout;

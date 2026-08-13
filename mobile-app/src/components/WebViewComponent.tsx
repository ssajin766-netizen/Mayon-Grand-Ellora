import React, { useCallback } from 'react';
import { ActivityIndicator, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';
import api from '../services/api';
import { useWebView } from '../context/WebViewContext';
import { setAuthenticated, setUser } from '../store/authSlice';

// This component renders the persistent WebView used throughout the app.
const launchRazorpayCheckout = (url: string) => {
  // TODO: Replace this simple external link with native Razorpay SDK integration.
  // For now, open the checkout URL in the external browser.
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  Linking.openURL(url);
};
// It registers its ref with the WebViewProvider and implements navigation
// handling such as logout, external link opening, and file downloads.

const WebViewComponent: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { setWebViewRef, setCurrentPath, clearSession, injectJavaScript, pendingUrl, clearPendingUrl } = useWebView();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  const HOME_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}`;
  console.log('HOME_URL:', HOME_URL);

  const hideFooterScript = `
(function () {
  'use strict';

  const STYLE_ID = 'mobile-app-hide-footer';

  function hideFooter() {
    let style = document.getElementById(STYLE_ID);

    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;

      style.textContent = \`
        /* Hide website footer in mobile app */
        footer,
        footer.footer,
        .footer,
        #footer,
        .site-footer,
        .main-footer {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }

        /* Remove extra space left by footer */
        body {
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
        }
      \`;

      if (document.head) {
        document.head.appendChild(style);
      }
    }

    /* Hide any footer elements that already exist */
    document.querySelectorAll(
      'footer, footer.footer, .footer, #footer, .site-footer, .main-footer'
    ).forEach(function (element) {
      element.style.setProperty('display', 'none', 'important');
      element.style.setProperty('visibility', 'hidden', 'important');
      element.style.setProperty('height', '0', 'important');
      element.style.setProperty('max-height', '0', 'important');
      element.style.setProperty('margin', '0', 'important');
      element.style.setProperty('padding', '0', 'important');
      element.style.setProperty('overflow', 'hidden', 'important');
    });
  }

  function start() {
    hideFooter();

    if (document.body) {
      const observer = new MutationObserver(function () {
        hideFooter();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  true;
})();
`;

   const webViewSource = pendingUrl ? pendingUrl : `${HOME_URL}/home`;

  // Register the WebView ref on mount via the context
  const webViewRefCallback = useCallback(
    (ref: any) => {
      if (ref) {
        setWebViewRef(ref);
      }
    },
    [setWebViewRef]
  );

  // Navigation state change handling – mirrors previous logic from WebDashboardScreen

  const onShouldStartLoadWithRequest = (request: any) => {
    const { url } = request;
    if (
      url.startsWith('tel:') ||
      url.startsWith('mailto:') ||
      url.startsWith('upi:') ||
      url.includes('wa.me') ||
      url.startsWith('whatsapp:')
    ) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      Linking.openURL(url);
      return false;
    }
    if (url.includes('razorpay.com')) {
      // Launch native Razorpay checkout instead of loading in WebView
      launchRazorpayCheckout(url);
      return false;
    }
    if (url.match(/\.(pdf|docx?|xlsx?|zip|jpe?g|png|webp)$/i)) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      Linking.openURL(url);
      return false;
    }
    return true;
  };

  const getPath = (url: string) => {
    try {
      return url.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
    } catch {
      return '/';
    }
  };

  const handleNavigationStateChange = async (event: any) => {
    const { url } = event;
    console.log('Navigation URL:', url);
    const path = getPath(url);
    // Guard: if navigating to a protected route while not authenticated, redirect to home
    const protectedRoutes = ['/residents', '/noticeboard', '/profile', '/dashboard'];
    if (protectedRoutes.includes(path) && !isAuthenticated) {
      console.log('Redirecting unauthenticated access to home');
      injectJavaScript(`window.location.href = '${HOME_URL}/home';`);
      return;
    }

    // Handle logout
    if (url.includes('/logout')) {
      try {
        await api.post('/auth/logout');
      } catch {}
      await clearSession();
      dispatch(logout());

      navigation.reset({ index: 0, routes: [{ name: 'PhoneLogin' as never }] });
      return;
    }

    // Handle authenticated routes – verify session
    if (
      url.includes('/home') ||
      url.includes('/dashboard') ||
      url.includes('/profile') ||
      url.includes('/residents') ||
      url.includes('/noticeboard') ||
      url.includes('/helpdesk') ||
      url.includes('/contacts')
    ) {
      try {
        const resp = await api.get('/api/auth/me');
        if (resp.data?.user) {
          dispatch(setUser(resp.data.user));
          dispatch(setAuthenticated(true));
        }
      } catch (err) {
        console.log('Session check failed:', err);
      }
    }

    // Handle login redirect – if we end up on /login after OAuth, verify session and go to home
    if (url.includes('/login')) {
      try {
        const resp = await api.get('/api/auth/me');
        if (resp.data?.user) {
          dispatch(setUser(resp.data.user));
          dispatch(setAuthenticated(true));
          // Update WebView path to home via JS injection
          injectJavaScript(`window.location.href = '${HOME_URL}/home';`);
        }
      } catch (err) {}
      // Stop further handling for this navigation event
      return;
    }
  };

  // File download progress placeholder – actual UI handled elsewhere
  const handleFileDownload = (event: any) => {
    const { downloadUrl } = event.nativeEvent;
    // For now, simply open the URL directly.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Linking.openURL(downloadUrl);
    return true;
  };

  const handleError = (event: any) => {
    console.log("WEBVIEW ERROR");
    console.log(event.nativeEvent);
  };

  const handleHttpError = (syntheticEvent: any) => {
    console.log("HTTP ERROR");
    console.log(syntheticEvent.nativeEvent);
  };

  // React to path changes – no extra actions needed here as the provider updates the URL.


  return (
    <WebView
      ref={webViewRefCallback}
      source={{ uri: webViewSource }}
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      javaScriptEnabled
      domStorageEnabled
      startInLoadingState
      pullToRefreshEnabled
      mixedContentMode="always"
      cacheEnabled
      allowsBackForwardNavigationGestures
      originWhitelist={['*']}
      injectedJavaScriptBeforeContentLoaded={hideFooterScript}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      onNavigationStateChange={handleNavigationStateChange}
      onError={handleError}
      onHttpError={handleHttpError}
      onFileDownload={handleFileDownload}
      onLoadStart={(event) => console.log('WEBVIEW LOAD START', event.nativeEvent.url)}
      onLoadEnd={(event) => {
        const url = event.nativeEvent.url;
        console.log('WEBVIEW LOAD END', url);
        // Hide footer as before
        setTimeout(() => {
          injectJavaScript(hideFooterScript);
        }, 100);
        // Clear pendingUrl after navigation to home page
        if (pendingUrl && url.includes('/home')) {
          clearPendingUrl();
        }
      }}
      renderLoading={() => <ActivityIndicator size="large" style={{ flex: 1 }} />}
      style={{ flex: 1, backgroundColor: '#fff' }}
    />
  );
};

export default WebViewComponent;

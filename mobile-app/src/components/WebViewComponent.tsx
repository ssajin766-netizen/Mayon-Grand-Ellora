import React, {
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  ActivityIndicator,
  Linking,
} from 'react-native';

import { WebView } from 'react-native-webview';

import { useNavigation } from '@react-navigation/native';

import {
  useAppDispatch,
} from '../store/hooks';

import {
  logout,
  setAuthenticated,
} from '../store/authSlice';

import {
  useWebView,
} from '../context/WebViewContext';

const WebViewComponent: React.FC = () => {
  const navigation =
    useNavigation<any>();

  const dispatch =
    useAppDispatch();

  const {
    setWebViewRef,
    setCurrentPath,
    clearSession,
    injectJavaScript,
    pendingUrl,
    clearPendingUrl,
  } = useWebView();

  // ==================================================
  // LOCAL WEBVIEW REF
  // ==================================================

  const webViewRef =
    useRef<WebView | null>(null);

  const lastPendingUrl =
    useRef<string | null>(null);

  // ==================================================
  // API URL
  // ==================================================

  const HOME_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    'https://e-society-erp9.onrender.com';

  // ==================================================
  // WEBVIEW SOURCE
  // ==================================================

  const webViewSource =
    pendingUrl ||
    `${HOME_URL}/home`;

  const safeSource =
    webViewSource.replace(
      /token=[^&]+/,
      'token=[REDACTED]'
    );

  console.log(
    'WEBVIEW SOURCE:',
    safeSource
  );

  // ==================================================
  // FOOTER HIDE SCRIPT
  // ==================================================

  const hideFooterScript = `
    (function () {
      'use strict';

      const STYLE_ID =
        'mobile-app-hide-footer';

      function hideFooter() {
        let style =
          document.getElementById(
            STYLE_ID
          );

        if (!style) {
          style =
            document.createElement(
              'style'
            );

          style.id =
            STYLE_ID;

          style.textContent = \`
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

            body {
              padding-bottom: 0 !important;
              margin-bottom: 0 !important;
            }
          \`;

          if (document.head) {
            document.head.appendChild(
              style
            );
          }
        }

        document
          .querySelectorAll(
            'footer, footer.footer, .footer, #footer, .site-footer, .main-footer'
          )
          .forEach(
            function (element) {
              element.style.setProperty(
                'display',
                'none',
                'important'
              );

              element.style.setProperty(
                'visibility',
                'hidden',
                'important'
              );

              element.style.setProperty(
                'height',
                '0',
                'important'
              );

              element.style.setProperty(
                'max-height',
                '0',
                'important'
              );

              element.style.setProperty(
                'margin',
                '0',
                'important'
              );

              element.style.setProperty(
                'padding',
                '0',
                'important'
              );

              element.style.setProperty(
                'overflow',
                'hidden',
                'important'
              );
            }
          );
      }

      function start() {
        hideFooter();

        if (document.body) {
          const observer =
            new MutationObserver(
              function () {
                hideFooter();
              }
            );

          observer.observe(
            document.body,
            {
              childList: true,
              subtree: true,
            }
          );
        }
      }

      if (
        document.readyState ===
        'loading'
      ) {
        document.addEventListener(
          'DOMContentLoaded',
          start
        );
      } else {
        start();
      }

    })();

    true;
  `;

  // ==================================================
  // REGISTER WEBVIEW
  // ==================================================

  const webViewRefCallback =
    useCallback(
      (ref: WebView | null) => {
        webViewRef.current =
          ref;

        setWebViewRef(ref);

        if (ref) {
          console.log(
            'WEBVIEW REF READY'
          );
        } else {
          console.log(
            'WEBVIEW REF CLEARED'
          );
        }
      },
      [setWebViewRef]
    );

  // ==================================================
  // PENDING SESSION URL
  // ==================================================

  useEffect(() => {
    if (!pendingUrl) {
      return;
    }

    const safeUrl =
      pendingUrl.replace(
        /token=[^&]+/,
        'token=[REDACTED]'
      );

    console.log(
      'PENDING URL DETECTED:',
      safeUrl
    );

    if (
      lastPendingUrl.current ===
      pendingUrl
    ) {
      return;
    }

    lastPendingUrl.current =
      pendingUrl;

    // ------------------------------------------------
    // If WebView already exists
    // ------------------------------------------------

    if (webViewRef.current) {
      console.log(
        'FORCING WEBVIEW TO SESSION URL'
      );

      webViewRef.current.injectJavaScript(`
        window.location.replace(
          ${JSON.stringify(pendingUrl)}
        );

        true;
      `);
    } else {
      console.log(
        'WEBVIEW NOT READY - SESSION URL WILL BE INITIAL SOURCE'
      );
    }
  }, [pendingUrl]);

  // ==================================================
  // EXTERNAL URL
  // ==================================================

  const launchExternalUrl =
    (url: string) => {
      Linking.openURL(url)
        .catch(error => {
          console.log(
            'Unable to open external URL:',
            error
          );
        });
    };

  // ==================================================
  // WEBVIEW REQUEST
  // ==================================================

  const onShouldStartLoadWithRequest =
    (request: any) => {
      const { url } = request;

      console.log(
        'WEBVIEW REQUEST:',
        url.replace(
          /token=[^&]+/,
          'token=[REDACTED]'
        )
      );

      // ------------------------------------------------
      // SESSION HAND-OFF
      // ------------------------------------------------

      if (
        url.includes(
          '/api/auth/mobile-webview-session'
        )
      ) {
        console.log(
          'ALLOWING WEBVIEW SESSION HAND-OFF'
        );

        return true;
      }

      // ------------------------------------------------
      // PHONE / EMAIL / WHATSAPP / UPI
      // ------------------------------------------------

      if (
        url.startsWith('tel:') ||
        url.startsWith('mailto:') ||
        url.startsWith('upi:') ||
        url.includes('wa.me') ||
        url.startsWith('whatsapp:')
      ) {
        launchExternalUrl(url);

        return false;
      }

      // ------------------------------------------------
      // RAZORPAY
      // ------------------------------------------------

      if (
        url.includes(
          'razorpay.com'
        ) ||
        url.includes(
          'checkout.razorpay.com'
        )
      ) {
        launchExternalUrl(url);

        return false;
      }

      // ------------------------------------------------
      // FILES
      // ------------------------------------------------

      if (
        url.match(
          /\.(pdf|docx?|xlsx?|zip|jpe?g|png|webp)$/i
        )
      ) {
        launchExternalUrl(url);

        return false;
      }

      return true;
    };

  // ==================================================
  // GET PATH
  // ==================================================

  const getPath =
    (url: string) => {
      try {
        return url
          .replace(
            /^https?:\/\/[^/]+/,
            ''
          )
          .split('?')[0];
      } catch {
        return '/';
      }
    };

  // ==================================================
  // NAVIGATION STATE
  // ==================================================

  const handleNavigationStateChange =
    async (event: any) => {
      const { url } = event;

      console.log(
        'NAVIGATION URL:',
        url.replace(
          /token=[^&]+/,
          'token=[REDACTED]'
        )
      );

      const path =
        getPath(url);

      setCurrentPath(path);

      // ==================================================
      // SESSION HAND-OFF
      // ==================================================

      if (
        url.includes(
          '/api/auth/mobile-webview-session'
        )
      ) {
        console.log(
          'WEBVIEW SESSION HAND-OFF REQUEST'
        );

        return;
      }

      // ==================================================
      // LOGOUT
      // ==================================================

      if (
        path === '/logout' ||
        url.includes('/logout?')
      ) {
        console.log(
          'WEBVIEW LOGOUT DETECTED'
        );

        try {
          await clearSession();
        } catch (error) {
          console.log(
            'clearSession error:',
            error
          );
        }

        dispatch(logout());

        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'PhoneLogin',
            },
          ],
        });

        return;
      }

      // ==================================================
      // LOGIN PAGE
      // ==================================================

      if (
        path === '/login'
      ) {
        console.log(
          'WEBVIEW REACHED LOGIN'
        );

        if (pendingUrl) {
          console.log(
            'WARNING: SESSION HAND-OFF MAY HAVE FAILED'
          );
        }

        return;
      }

      // ==================================================
      // PROTECTED PAGES
      // ==================================================

      if (
        path === '/home' ||
        path === '/dashboard' ||
        path === '/profile' ||
        path === '/residents' ||
        path === '/noticeboard' ||
        path === '/helpdesk' ||
        path === '/contacts' ||
        path === '/bill'
      ) {
        console.log(
          'WEBVIEW PROTECTED PAGE:',
          path
        );
      }
    };

  // ==================================================
  // DOWNLOAD
  // ==================================================

  const handleFileDownload =
    (event: any) => {
      const {
        downloadUrl,
      } = event.nativeEvent;

      if (downloadUrl) {
        launchExternalUrl(
          downloadUrl
        );
      }

      return true;
    };

  // ==================================================
  // ERROR
  // ==================================================

  const handleError =
    (event: any) => {
      console.log(
        'WEBVIEW ERROR:',
        event.nativeEvent
      );
    };

  const handleHttpError =
    (event: any) => {
      console.log(
        'WEBVIEW HTTP ERROR:',
        event.nativeEvent
      );
    };

  // ==================================================
  // WEBVIEW
  // ==================================================

  return (
    <WebView
      ref={webViewRefCallback}

      source={{
        uri: webViewSource,
      }}

      sharedCookiesEnabled={true}

      thirdPartyCookiesEnabled={true}

      javaScriptEnabled={true}

      domStorageEnabled={true}

      startInLoadingState={true}

      pullToRefreshEnabled={true}

      mixedContentMode="always"

      cacheEnabled={true}

      allowsBackForwardNavigationGestures={
        true
      }

      originWhitelist={['*']}

      injectedJavaScriptBeforeContentLoaded={
        hideFooterScript
      }

      onShouldStartLoadWithRequest={
        onShouldStartLoadWithRequest
      }

      onNavigationStateChange={
        handleNavigationStateChange
      }

      onError={
        handleError
      }

      onHttpError={
        handleHttpError
      }

      onFileDownload={
        handleFileDownload
      }

      onLoadStart={
        event => {
          const url =
            event.nativeEvent.url;

          console.log(
            '======================================'
          );

          console.log(
            'WEBVIEW LOAD START:',
            url.replace(
              /token=[^&]+/,
              'token=[REDACTED]'
            )
          );

          console.log(
            'PENDING URL:',
            pendingUrl
              ? pendingUrl.replace(
                  /token=[^&]+/,
                  'token=[REDACTED]'
                )
              : 'NONE'
          );

          console.log(
            '======================================'
          );
        }
      }

      onLoadEnd={
        event => {
          const url =
            event.nativeEvent.url;

          console.log(
            'WEBVIEW LOAD END:',
            url
          );

          setTimeout(() => {
            injectJavaScript(
              hideFooterScript
            );
          }, 100);

          // ==================================================
          // SESSION SUCCESS
          // ==================================================

          if (
            pendingUrl &&
            pendingUrl.includes(
              '/api/auth/mobile-webview-session'
            ) &&
            url.includes('/home')
          ) {
            console.log(
              '======================================'
            );

            console.log(
              'WEBVIEW SESSION ESTABLISHED'
            );

            console.log(
              'AUTHENTICATED HOME LOADED'
            );

            console.log(
              '======================================'
            );

            clearPendingUrl();

            lastPendingUrl.current =
              null;

            dispatch(
              setAuthenticated(true)
            );
          }

          // ==================================================
          // SESSION FAILURE
          // ==================================================

          if (
            pendingUrl &&
            pendingUrl.includes(
              '/api/auth/mobile-webview-session'
            ) &&
            url.includes('/login')
          ) {
            console.log(
              '======================================'
            );

            console.log(
              'WEBVIEW SESSION HAND-OFF FAILED'
            );

            console.log(
              'Session endpoint redirected to /login'
            );

            console.log(
              '======================================'
            );
          }
        }
      }

      renderLoading={() => (
        <ActivityIndicator
          size="large"
          style={{
            flex: 1,
          }}
        />
      )}

      style={{
        flex: 1,
        backgroundColor: '#fff',
      }}
    />
  );
};

export default WebViewComponent;
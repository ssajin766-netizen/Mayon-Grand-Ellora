import React, {
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';

import RazorpayCheckout from 'react-native-razorpay';

import { WebView } from 'react-native-webview';

import {
  useAppDispatch,
  useAppSelector,
} from '../store/hooks';

import {
  logout,
  setAuthenticated,
} from '../store/authSlice';

import {
  saveAuthState,
  clearAuthState,
} from '../services/authPersistence';

import {
  clearMobileAuthToken,
} from '../services/mobileAuthToken';

import {
  useWebView,
} from '../context/WebViewContext';

const WebViewComponent: React.FC = () => {

  const dispatch =
    useAppDispatch();

  const user =
  useAppSelector(
    state => state.auth.user
  );

const {
  setWebViewRef,
  setCurrentPath,
  injectJavaScript,
  pendingUrl,
  clearPendingUrl,
  clearRestoreTicket,
} = useWebView();

  // ==================================================
  // LOCAL WEBVIEW REF
  // ==================================================

  const webViewRef =
    useRef<WebView | null>(null);

  // ==================================================
  // LOGOUT GUARD
  // ==================================================

  const logoutInProgressRef =
    useRef(false);

  // Prevent an Android WebView TLS/network error from leaving
  // the logout flow permanently stuck on /logout.
  const logoutRetryCountRef =
    useRef(0);

  // ==================================================
  // MOBILE SESSION HAND-OFF STATE
  // ==================================================
  // The pending URL is navigation state only. Authentication
  // is accepted only after the WebView reaches an authenticated
  // page following the one-time mobile session hand-off.

  const mobileSessionHandoffRef =
    useRef<string | null>(null);

  const mobileSessionEstablishedRef =
    useRef(false);

  // ==================================================
  // SESSION HAND-OFF STATE
  // ==================================================
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
// HIDE WEBSITE NAVBAR IN MOBILE APP
// ==================================================

const hideWebsiteNavbarScript = `
  (function () {
    'use strict';

    const STYLE_ID = 'mobile-app-hide-website-navbar';

    function hideWebsiteNavbar() {

      // Add CSS once
      if (!document.getElementById(STYLE_ID)) {

        const style = document.createElement('style');

        style.id = STYLE_ID;

        style.textContent = \`

          /* ==========================================
             HIDE WEBSITE HEADER
             ========================================== */

          nav.navbar,
          nav.navbar.navbar-expand-lg,
          nav.navbar.sticky-top,
          .navbar.sticky-top,
          #mainNavbar {

            display: none !important;

            visibility: hidden !important;

            height: 0 !important;

            min-height: 0 !important;

            max-height: 0 !important;

            margin: 0 !important;

            padding: 0 !important;

            overflow: hidden !important;
          }

          /* Remove any space left by navbar */

          body {

            padding-top: 0 !important;

            margin-top: 0 !important;
          }

          /* ==========================================
             REMOVE BOOTSTRAP COLLAPSED NAVBAR
             ========================================== */

          .navbar-collapse {

            display: none !important;

            height: 0 !important;

            visibility: hidden !important;
          }

        \`;

        if (document.head) {
          document.head.appendChild(style);
        }
      }

      // ==========================================
      // DIRECTLY HIDE NAVBAR
      // ==========================================

      document
        .querySelectorAll(
          'nav.navbar, nav.navbar.navbar-expand-lg, nav.navbar.sticky-top, .navbar.sticky-top, #mainNavbar'
        )
        .forEach(function (element) {

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
            'min-height',
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
        });

      // Also hide Bootstrap collapse if it exists

      document
        .querySelectorAll(
          '.navbar-collapse'
        )
        .forEach(function (element) {

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
        });
    }

    // ==========================================
    // START
    // ==========================================

    function start() {

      hideWebsiteNavbar();

      // Keep checking because pages can dynamically
      // recreate the navbar.

      if (document.body) {

        const observer =
          new MutationObserver(function () {

            hideWebsiteNavbar();

          });

        observer.observe(
          document.body,
          {
            childList: true,
            subtree: true
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
  // MOBILE PAYMENT BRIDGE
  // ==================================================

  const mobilePaymentBridgeScript = `
    (function () {
      'use strict';

      if (window.__MOBILE_PAYMENT_BRIDGE__) {
        return;
      }

      window.__MOBILE_PAYMENT_BRIDGE__ = true;

      function isPayBillElement(element) {
        if (!element) {
          return false;
        }

        const text = (
          element.innerText ||
          element.textContent ||
          ''
        ).trim().toUpperCase();

        return text.includes('PAY BILL');
      }

      document.addEventListener(
        'click',
        function (event) {
          let element = event.target;

          if (
            element &&
            element.nodeType === Node.TEXT_NODE
          ) {
            element = element.parentElement;
          }

          if (
            element &&
            typeof element.closest === 'function'
          ) {
            element = element.closest(
              'button, a, input, [role="button"]'
            );
          }

          if (!isPayBillElement(element)) {
            return;
          }

          console.log(
            'MOBILE PAYMENT BUTTON DETECTED'
          );

          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          if (
            window.ReactNativeWebView &&
            window.ReactNativeWebView.postMessage
          ) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: 'MOBILE_PAY_BILL'
              })
            );
          }
        },
        true
      );

      console.log(
        'MOBILE PAYMENT BRIDGE INSTALLED'
      );
    })();

    true;
  `;

// ==================================================
// NATIVE RAZORPAY PAYMENT
// ==================================================

const startNativePayment = useCallback(() => {
  if (!webViewRef.current) {
    Alert.alert(
      'Payment Error',
      'Payment page is not ready.'
    );
    return;
  }

  console.log('========================================');
  console.log('MOBILE RAZORPAY PAYMENT START');
  console.log('CREATING ORDER THROUGH WEBVIEW SESSION');
  console.log('========================================');

  const createOrderScript = `
    (async function () {
      try {

        console.log('MOBILE: REQUESTING PAYMENT ORDER');

        const response = await fetch(
          '/create-order',
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        const status = response.status;
        const contentType =
          response.headers.get('content-type') || '';

        const text = await response.text();

        console.log(
          'MOBILE: CREATE ORDER HTTP STATUS:',
          status
        );

        console.log(
          'MOBILE: CREATE ORDER CONTENT TYPE:',
          contentType
        );

        console.log(
          'MOBILE: CREATE ORDER RAW RESPONSE:',
          text
        );

        let data = null;

        try {
          data = JSON.parse(text);
        } catch (parseError) {

          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: 'MOBILE_PAYMENT_ERROR',
              message:
                'Payment server returned an invalid response.',
              status: status,
              rawResponse: text.substring(0, 500)
            })
          );

          return;
        }

        console.log(
          'MOBILE: CREATE ORDER JSON:',
          data
        );

        // ==========================================
        // NORMAL SERVER FORMAT
        // ==========================================

        let order = null;
        let key = '';

        if (
          data &&
          data.success === true &&
          data.order
        ) {
          order = data.order;
          key = data.key || '';
        }

        // ==========================================
        // FALLBACK FORMAT
        // ==========================================

        else if (
          data &&
          data.id &&
          data.amount
        ) {
          order = data;
        }

        else {

          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: 'MOBILE_PAYMENT_ERROR',
              message:
                data?.message ||
                'Invalid Razorpay order received from server.',
              status: status,
              response: data
            })
          );

          return;
        }

        // ==========================================
        // VALIDATE ORDER
        // ==========================================

        if (!order.id) {

          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: 'MOBILE_PAYMENT_ERROR',
              message:
                'Razorpay order ID is missing.'
            })
          );

          return;
        }

        if (
          !order.amount ||
          Number(order.amount) <= 0
        ) {

          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: 'MOBILE_PAYMENT_ERROR',
              message:
                'Razorpay order amount is invalid.'
            })
          );

          return;
        }

        // ==========================================
        // SEND ORDER + KEY TO REACT NATIVE
        // ==========================================

        console.log(
          '========================================'
        );

        console.log(
          'MOBILE: RAZORPAY ORDER READY'
        );

        console.log(
          'ORDER ID:',
          order.id
        );

        console.log(
          'ORDER AMOUNT PAISE:',
          order.amount
        );

        console.log(
          'ORDER AMOUNT INR:',
          Number(order.amount) / 100
        );

        console.log(
          'RAZORPAY KEY FROM SERVER:',
          key ? 'AVAILABLE' : 'MISSING'
        );

        console.log(
          '========================================'
        );

        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'MOBILE_PAYMENT_ORDER',
            order: order,
            key: key
          })
        );

      } catch (error) {

        console.error(
          'MOBILE CREATE ORDER ERROR:',
          error
        );

        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'MOBILE_PAYMENT_ERROR',
            message:
              error?.message ||
              'Unable to create payment order.'
          })
        );
      }
    })();

    true;
  `;

  webViewRef.current.injectJavaScript(
    createOrderScript
  );

}, []);

  // ==================================================
  // VERIFY NATIVE PAYMENT
  // ==================================================

  const verifyNativePayment = useCallback(
    (
      paymentData: any,
      orderId: string
    ) => {

      if (!webViewRef.current) {
        Alert.alert(
          'Payment Error',
          'Payment page is not available.'
        );
        return;
      }

      console.log(
        '========================================'
      );
      console.log(
        'VERIFYING MOBILE RAZORPAY PAYMENT'
      );
      console.log(
        'ORDER:',
        orderId
      );
      console.log(
        'PAYMENT:',
        paymentData?.razorpay_payment_id
      );
      console.log(
        '========================================'
      );

      const verificationScript = `
        (async function () {
          try {
            const response = await fetch(
              '/payment-success',
              {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  razorpay_order_id:
                    ${JSON.stringify(
                      paymentData?.razorpay_order_id ||
                      orderId
                    )},

                  razorpay_payment_id:
                    ${JSON.stringify(
                      paymentData?.razorpay_payment_id ||
                      ''
                    )},

                  razorpay_signature:
                    ${JSON.stringify(
                      paymentData?.razorpay_signature ||
                      ''
                    )}
                })
              }
            );

            const text = await response.text();

            let data;

            try {
              data = JSON.parse(text);
            } catch (error) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  type:
                    'MOBILE_PAYMENT_VERIFY_ERROR',
                  message:
                    'Invalid payment verification response.'
                })
              );
              return;
            }

            console.log(
              'MOBILE PAYMENT VERIFY RESPONSE',
              data
            );

            if (
              response.ok &&
              data.success
            ) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  type: 'MOBILE_PAYMENT_SUCCESS',
                  invoice: data.invoice || ''
                })
              );
            } else {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  type:
                    'MOBILE_PAYMENT_VERIFY_ERROR',
                  message:
                    data.message ||
                    'Payment verification failed.'
                })
              );
            }

          } catch (error) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type:
                  'MOBILE_PAYMENT_VERIFY_ERROR',
                message:
                  error?.message ||
                  'Payment verification failed.'
              })
            );
          }
        })();

        true;
      `;

      webViewRef.current.injectJavaScript(
        verificationScript
      );
    },
    []
  );

  // ==================================================
  // WEBVIEW MESSAGE HANDLER
  // ==================================================

  const handleWebViewMessage = useCallback(
    async (event: any) => {

      try {

        const rawData =
          event?.nativeEvent?.data;

        if (!rawData) {
          return;
        }

        const message =
          JSON.parse(rawData);

        console.log(
          'WEBVIEW MESSAGE:',
          message?.type
        );

        if (
          message?.type ===
          'MOBILE_PAY_BILL'
        ) {
          startNativePayment();
          return;
        }

        if (
          message?.type ===
          'MOBILE_PAYMENT_ORDER'
        ) {

          const order = message.order;

          if (!order?.id) {
            Alert.alert(
              'Payment Error',
              'Invalid Razorpay order received.'
            );
            return;
          }

          if (
            !order?.amount ||
            Number(order.amount) <= 0
          ) {
            Alert.alert(
              'Payment Error',
              'Invalid payment amount received from server.'
            );
            return;
          }

          const razorpayKey =
            message.key ||
            process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;

          if (!razorpayKey) {
            Alert.alert(
              'Payment Error',
              'Razorpay Key ID is not configured.'
            );

            console.error(
              'EXPO_PUBLIC_RAZORPAY_KEY_ID missing'
            );

            return;
          }

          console.log(
            '========================================'
          );
          console.log(
            'RAZORPAY ORDER CREATED'
          );
          console.log(
            'ORDER ID:',
            order.id
          );
          console.log(
            'AMOUNT:',
            order.amount
          );
          console.log(
            'AMOUNT INR:',
            Number(order.amount) / 100
          );
          console.log(
            '========================================'
          );

          try {
const razorpayOptions: any = {
  key: razorpayKey,
  amount: String(order.amount),
  currency: order.currency || 'INR',
  name: 'Mayon Grand Ellora',
  description: 'Maintenance Bill',
  order_id: order.id,
  prefill: {},
  theme: {
    color: '#ff8c00',
  },
};

console.log('RAZORPAY OPTIONS:', {
  key: razorpayKey ? 'PRESENT' : 'MISSING',
  amount: razorpayOptions.amount,
  currency: razorpayOptions.currency,
  order_id: razorpayOptions.order_id,
});

const paymentData =
  await RazorpayCheckout.open(razorpayOptions);

            console.log(
              '========================================'
            );
            console.log(
              'RAZORPAY PAYMENT SUCCESS'
            );
            console.log(
              'PAYMENT ID:',
              paymentData?.razorpay_payment_id
            );
            console.log(
              '========================================'
            );

            verifyNativePayment(
              paymentData,
              order.id
            );

          } catch (error: any) {

            console.log(
              'RAZORPAY PAYMENT CANCELLED/FAILED:',
              error
            );

            const description =
              error?.description ||
              error?.message ||
              'Unable to complete payment.';

            Alert.alert(
              'Payment Failed',
              description
            );
          }

          return;
        }

        if (
  message?.type ===
  'MOBILE_PAYMENT_ERROR'
) {
  console.error(
    '========================================'
  );

  console.error(
    'MOBILE PAYMENT ERROR'
  );

  console.error(
    'STATUS:',
    message.status
  );

  console.error(
    'MESSAGE:',
    message.message
  );

  console.error(
    'RAW RESPONSE:',
    message.rawResponse
  );

  console.error(
    'RESPONSE:',
    message.response
  );

  console.error(
    '========================================'
  );

  Alert.alert(
    'Payment Failed',
    message.message ||
      'Unable to create payment order.'
  );

  return;
}

        if (
          message?.type ===
          'MOBILE_PAYMENT_SUCCESS'
        ) {

          Alert.alert(
            'Payment Successful',
            message.invoice
              ? `Invoice: ${message.invoice}`
              : 'Your maintenance payment was successful.',
            [
              {
                text: 'OK',
                onPress: () => {
                  if (webViewRef.current) {
                    webViewRef.current.reload();
                  }
                }
              }
            ]
          );

          return;
        }

        if (
          message?.type ===
          'MOBILE_PAYMENT_VERIFY_ERROR'
        ) {
          Alert.alert(
            'Payment Verification Failed',
            message.message ||
              'Unable to verify payment.'
          );
        }

      } catch (error) {
        console.log(
          'WEBVIEW MESSAGE ERROR:',
          error
        );
      }
    },
    [
      startNativePayment,
      verifyNativePayment,
      clearPendingUrl,
      dispatch,
      clearAuthState
    ]
  );

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

        mobileSessionHandoffRef.current = url;
        mobileSessionEstablishedRef.current = false;

        return true;
      }

      // ------------------------------------------------
      // LOGOUT
      // ------------------------------------------------
      //
      // IMPORTANT:
      // The server can redirect /logout to /login so quickly
      // that Android WebView may not emit a navigation-state
      // event for /logout. Therefore logoutInProgressRef MUST
      // be set here, in onShouldStartLoadWithRequest, before
      // Express processes the request.
      //
      // Without this, the following sequence can happen:
      //
      //   REQUEST /logout
      //       -> REQUEST /login?loggedOut=1
      //
      // and handleNavigationStateChange sees only /login.
      // Native auth then incorrectly remains logged in.
      //

      const requestPath =
        getPath(url);

      if (
        requestPath === '/logout' ||
        requestPath.startsWith('/logout?') ||
        url.includes('/logout?')
      ) {

        if (!logoutInProgressRef.current) {

          logoutInProgressRef.current = true;

          logoutRetryCountRef.current = 0;

          mobileSessionHandoffRef.current = null;
          mobileSessionEstablishedRef.current = false;

          console.log(
            '======================================'
          );

          console.log(
            'WEBVIEW LOGOUT REQUEST ACCEPTED'
          );

          console.log(
            'SERVER LOGOUT IN PROGRESS'
          );

          console.log(
            '======================================'
          );
        }

        // Allow the request to reach Express.
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
  path.startsWith('/logout?') ||
  url.includes('/logout?')
) {

  // IMPORTANT:
  // Do NOT clear Redux/auth persistence here.
  //
  // /logout has only STARTED at this point.
  // The WebView must remain mounted so Express can complete:
  //
  //   req.logout()
  //   req.session.destroy()
  //   clearCookie()
  //   redirect('/login?loggedOut=1')
  //
  // Native authentication is cleared only after the
  // WebView reaches the login page.

  if (!logoutInProgressRef.current) {

    logoutInProgressRef.current = true;

    logoutRetryCountRef.current = 0;

    mobileSessionHandoffRef.current = null;

    mobileSessionEstablishedRef.current = false;

    console.log(
      '======================================'
    );

    console.log(
      'WEBVIEW LOGOUT REQUEST STARTED'
    );

    console.log(
      'WAITING FOR SERVER LOGOUT TO COMPLETE'
    );

    console.log(
      '======================================'
    );
  }

  // IMPORTANT:
  // Allow /logout to continue to Express.
  return;
}


// ==================================================
// LOGIN PAGE / LOGOUT CONFIRMATION
// ==================================================

const isLoginPage =
  path === '/login' ||
  path.startsWith('/login?');

if (isLoginPage) {

  console.log(
    'WEBVIEW REACHED LOGIN'
  );

  // ==================================================
  // SERVER LOGOUT COMPLETED
  // ==================================================

  if (logoutInProgressRef.current) {

    console.log(
      '======================================'
    );

    console.log(
      'SERVER LOGOUT CONFIRMED'
    );

    console.log(
      'CLEARING NATIVE AUTHENTICATION'
    );

    console.log(
      '======================================'
    );


    // ------------------------------------------------
    // CLEAR ASYNC STORAGE AUTH
    // ------------------------------------------------

    try {

      await clearAuthState();

      console.log(
        'PERSISTED AUTH STATE CLEARED'
      );

    } catch (error) {

      console.error(
        'FAILED TO CLEAR PERSISTED AUTH:',
        error
      );

    }


    // ------------------------------------------------
    // CLEAR SECURESTORE MOBILE TOKEN
    // ------------------------------------------------

    try {

      await clearMobileAuthToken();

      console.log(
        'MOBILE AUTH TOKEN CLEARED'
      );

    } catch (error) {

      console.error(
        'FAILED TO CLEAR MOBILE AUTH TOKEN:',
        error
      );

    }


    // ------------------------------------------------
    // CLEAR REDUX AUTH STATE
    // ------------------------------------------------

    dispatch(
      logout()
    );

    console.log(
      'MOBILE AUTH STATE CLEARED'
    );


    // ------------------------------------------------
    // RESET MOBILE SESSION STATE
    // ------------------------------------------------

    logoutInProgressRef.current = false;

    logoutRetryCountRef.current = 0;

    mobileSessionHandoffRef.current = null;

    mobileSessionEstablishedRef.current = false;


    console.log(
      '======================================'
    );

    console.log(
      'SWITCHING FROM MAINSTACK TO AUTHSTACK'
    );

    console.log(
      '======================================'
    );

    return;
  }


  // ==================================================
  // NORMAL LOGIN PAGE
  // ==================================================

  if (
    mobileSessionHandoffRef.current
  ) {

    console.log(
      'WARNING: MOBILE SESSION HAND-OFF RETURNED TO LOGIN'
    );

    mobileSessionHandoffRef.current = null;

    mobileSessionEstablishedRef.current = false;
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

      if (path === '/bill') {
        setTimeout(() => {
          injectJavaScript(
            mobilePaymentBridgeScript
          );
        }, 300);
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

    const error =
      event?.nativeEvent;

    const errorUrl =
      error?.url || '';

    const safeErrorUrl =
      errorUrl.replace(
        /token=[^&]+/,
        'token=[REDACTED]'
      );

    console.log(
      '======================================'
    );

    console.log(
      'WEBVIEW ERROR'
    );

    console.log(
      'CODE:',
      error?.code
    );

    console.log(
      'DESCRIPTION:',
      error?.description
    );

    console.log(
      'URL:',
      safeErrorUrl
    );

    console.log(
      '======================================'
    );


    // --------------------------------------------------
    // LOGOUT NETWORK/TLS ERROR
    // --------------------------------------------------
    //
    // Android WebView can occasionally report a TLS/network
    // error for the logout navigation even though the server
    // is healthy. Do not clear native auth on this error
    // because the server session may still exist.
    //
    // Retry the server logout request a maximum of two times.
    //

    if (
      logoutInProgressRef.current &&
      errorUrl.includes('/logout')
    ) {

      console.log(
        '======================================'
      );

      console.log(
        'WEBVIEW LOGOUT NETWORK ERROR'
      );

      console.log(
        'LOGOUT ERROR CODE:',
        error?.code
      );

      console.log(
        'LOGOUT ERROR DESCRIPTION:',
        error?.description
      );

      console.log(
        'LOGOUT RETRY COUNT:',
        logoutRetryCountRef.current
      );

      console.log(
        '======================================'
      );

      if (
        logoutRetryCountRef.current >= 2
      ) {

        console.error(
          'WEBVIEW LOGOUT FAILED AFTER RETRIES'
        );

        Alert.alert(
          'Logout Failed',
          'Unable to contact the server. Please check your internet connection and try again.'
        );

        logoutInProgressRef.current = false;
        logoutRetryCountRef.current = 0;

        return;
      }

      logoutRetryCountRef.current += 1;

      setTimeout(() => {

        if (!webViewRef.current) {
          return;
        }

        const retryUrl =
          `${HOME_URL}/logout?mobileRetry=${Date.now()}`;

        console.log(
          'WEBVIEW LOGOUT RETRY:',
          retryUrl
        );

        webViewRef.current.injectJavaScript(`
          window.location.replace(
            ${JSON.stringify(retryUrl)}
          );

          true;
        `);

      }, 700);

      return;
    }


    // --------------------------------------------------
    // SESSION HAND-OFF ERROR
    // --------------------------------------------------

    if (
      errorUrl.includes(
        '/api/auth/mobile-webview-session'
      )
    ) {

      console.log(
        'WEBVIEW SESSION HAND-OFF ERROR'
      );

      console.log(
        'The mobile authentication is still active.'
      );

      console.log(
        'NOT LOGGING OUT USER.'
      );

      // IMPORTANT:
      // Do NOT call clearSession()
      // Do NOT dispatch(logout())
      // Do NOT navigate to PhoneLogin

      mobileSessionHandoffRef.current = null;
      mobileSessionEstablishedRef.current = false;

      // Never keep a failed/consumed one-time hand-off URL as pending.
      // Otherwise React can recreate the same token URL and retry it.
      clearPendingUrl();

      // The session cookie may already have been created before a
      // connection reset. Retry the normal protected page without
      // replaying the one-time token.
      setTimeout(() => {
        if (!webViewRef.current) {
          return;
        }

        const homeUrl = `${HOME_URL}/home`;

        console.log(
          'WEBVIEW HAND-OFF RECOVERY -> /home'
        );

        webViewRef.current.injectJavaScript(`
          window.location.replace(
            ${JSON.stringify(homeUrl)}
          );

          true;
        `);
      }, 500);

      return;
    }
  };


const handleHttpError =
  (event: any) => {

    const error =
      event?.nativeEvent;

    const errorUrl =
      error?.url || '';

    const safeErrorUrl =
      errorUrl.replace(
        /token=[^&]+/,
        'token=[REDACTED]'
      );

    console.log(
      '======================================'
    );

    console.log(
      'WEBVIEW HTTP ERROR'
    );

    console.log(
      'STATUS:',
      error?.statusCode
    );

    console.log(
      'DESCRIPTION:',
      error?.description
    );

    console.log(
      'URL:',
      safeErrorUrl
    );

    console.log(
      '======================================'
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

    mixedContentMode="never"

    /*
     * Avoid stale Android WebView network/cache state after
     * intermittent Render/Cloudflare HTTPS errors.
     */
    cacheEnabled={true}
    cacheMode="LOAD_DEFAULT"

    androidLayerType="hardware"

    allowsBackForwardNavigationGestures={
      true
    }

    originWhitelist={['https://*']}

    onMessage={
      handleWebViewMessage
    }

    injectedJavaScriptBeforeContentLoaded={
      hideFooterScript +
      hideWebsiteNavbarScript +
      mobilePaymentBridgeScript
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
      async event => {

        const url =
          event.nativeEvent.url;

        const safeUrl =
          url.replace(
            /token=[^&]+/,
            'token=[REDACTED]'
          );

        console.log(
          '======================================'
        );

        console.log(
          'WEBVIEW LOAD START:',
          safeUrl
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
      async event => {

        const url =
          event.nativeEvent.url;

        const safeUrl =
          url.replace(
            /token=[^&]+/,
            'token=[REDACTED]'
          );

        console.log(
          'WEBVIEW LOAD END:',
          safeUrl
        );


        // ==================================================
        // INJECT MOBILE SCRIPTS
        // ==================================================

        setTimeout(() => {

          injectJavaScript(
            hideFooterScript
          );

          injectJavaScript(
            hideWebsiteNavbarScript
          );

          injectJavaScript(
            mobilePaymentBridgeScript
          );

        }, 100);
        // ==================================================
        // SESSION SUCCESS
        // ==================================================

        const isAuthenticatedPage =
          url.includes('/home') ||
          url.includes('/dashboard') ||
          url.includes('/profile') ||
          url.includes('/residents') ||
          url.includes('/noticeboard') ||
          url.includes('/helpdesk') ||
          url.includes('/contacts') ||
          url.includes('/bill');

        if (
  mobileSessionHandoffRef.current &&
  !mobileSessionEstablishedRef.current &&
  isAuthenticatedPage
) {

  mobileSessionEstablishedRef.current = true;
  mobileSessionHandoffRef.current = null;

  console.log(
    '========================================'
  );

  console.log(
    'WEBVIEW SESSION ESTABLISHED'
  );

  console.log(
    'AUTHENTICATED PAGE LOADED'
  );

  console.log(
    '========================================'
  );

  // ----------------------------------------------------
  // The one-time restore ticket has now been consumed.
  // It must never be reused.
  // ----------------------------------------------------

  clearRestoreTicket();

  clearPendingUrl();

  try {

    if (user) {

      await saveAuthState(user);

      console.log(
        'MOBILE AUTH STATE PERSISTED'
      );

    } else {

      console.warn(
        'USER NOT AVAILABLE - AUTH PERSISTENCE SKIPPED'
      );

    }

  } catch (error) {

    console.error(
      'FAILED TO PERSIST MOBILE AUTH STATE:',
      error
    );

  }

  dispatch(
    setAuthenticated(true)
  );

  console.log(
    'MOBILE AUTHENTICATION ENABLED'
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
            'SESSION ENDPOINT REDIRECTED TO /LOGIN'
          );

          console.log(
            '======================================'
          );

          // ------------------------------------------------
          // Clear the failed one-time session hand-off.
          // ------------------------------------------------

          mobileSessionHandoffRef.current = null;

          mobileSessionEstablishedRef.current = false;

          // ------------------------------------------------
          // The one-time restore ticket can no longer be
          // reused after the session hand-off fails.
          // ------------------------------------------------

          clearRestoreTicket();

          // ------------------------------------------------
          // Prevent the failed session URL from remaining
          // as the WebView pending source.
          // ------------------------------------------------

          clearPendingUrl();

          console.log(
            'FAILED RESTORE TICKET CLEARED'
          );

          console.log(
            'FAILED PENDING SESSION URL CLEARED'
          );

          // ------------------------------------------------
          // IMPORTANT:
          //
          // Do NOT clear native authentication here.
          //
          // Native OTP authentication is still valid.
          // Only the WebView session hand-off failed.
          //
          // The native authentication restore flow can
          // create a new restore ticket when required.
          // ------------------------------------------------

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

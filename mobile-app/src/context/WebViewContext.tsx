import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import { WebView } from 'react-native-webview';

const HOME_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://e-society-erp9.onrender.com';


// ==========================================================
// TYPES
// ==========================================================

type WebViewContextType = {

  navigate: (path: string) => void;

  reload: () => void;

  goBack: () => void;

  clearSession: () => void;

  setWebViewRef: (
    ref: WebView | null
  ) => void;

  currentPath: string;

  setCurrentPath: (
    path: string
  ) => void;

  injectJavaScript: (
    script: string
  ) => void;

  pendingUrl: string | null;

  clearPendingUrl: () => void;


  // ========================================================
  // MOBILE SESSION RESTORE
  // ========================================================

  restoreTicket: string | null;

  setRestoreTicket: (
    ticket: string | null
  ) => void;

  clearRestoreTicket: () => void;

};


// ==========================================================
// CONTEXT
// ==========================================================

const WebViewContext =
  createContext<
    WebViewContextType | undefined
  >(undefined);


// ==========================================================
// HOOK
// ==========================================================

export const useWebView = () => {

  const ctx =
    useContext(
      WebViewContext
    );

  if (!ctx) {

    throw new Error(
      'useWebView must be used within WebViewProvider'
    );

  }

  return ctx;

};


// ==========================================================
// PROVIDER
// ==========================================================

export const WebViewProvider:
  React.FC<{
    children: React.ReactNode;
  }> = ({
    children,
  }) => {


  // ========================================================
  // WEBVIEW REF
  // ========================================================

  const webViewRef =
    useRef<WebView | null>(
      null
    );


  // ========================================================
  // CURRENT PATH
  // ========================================================

  const [
    currentPath,
    setCurrentPath,
  ] =
    useState<string>(
      '/home'
    );


  // ========================================================
  // PENDING URL
  // ========================================================

  const [
    pendingUrl,
    setPendingUrl,
  ] =
    useState<string | null>(
      null
    );


  // ========================================================
  // RESTORE TICKET
  // ========================================================
  //
  // This is deliberately kept only in React memory.
  //
  // It must NOT be stored in AsyncStorage.
  //
  // Backend ticket lifetime:
  // approximately 60 seconds.
  //
  // ========================================================

  const [
    restoreTicket,
    setRestoreTicketState,
  ] =
    useState<string | null>(
      null
    );


  // ========================================================
  // SET WEBVIEW REF
  // ========================================================

  const setWebViewRef =
    useCallback(
      (
        ref: WebView | null
      ) => {

        webViewRef.current =
          ref;


        console.log(
          'WEBVIEW REF:',
          ref
            ? 'READY'
            : 'CLEARED'
        );

      },
      []
    );


// ========================================================
// SET RESTORE TICKET
// ========================================================

const setRestoreTicket = useCallback(
  (ticket: string | null) => {

    if (!ticket) {

      console.log(
        'CLEARING WEBVIEW RESTORE TICKET'
      );

      setRestoreTicketState(null);

      return;
    }

    console.log(
      '========================================'
    );

    console.log(
      'WEBVIEW RESTORE TICKET RECEIVED'
    );

    console.log(
      'RESTORE TICKET:',
      '[REDACTED]'
    );

    console.log(
      '========================================'
    );

    // ----------------------------------------------------
    // Store ticket only in React memory.
    // Never persist this one-time ticket.
    // ----------------------------------------------------

    setRestoreTicketState(ticket);

    // ----------------------------------------------------
    // IMPORTANT:
    //
    // Convert the one-time restore ticket into the
    // WebView session hand-off URL.
    //
    // This URL causes the backend to:
    //
    //   1. Consume the one-time ticket
    //   2. Load the user
    //   3. Create Passport session
    //   4. Set the session cookie
    //   5. Redirect to /home
    //
    // ----------------------------------------------------

    const sessionUrl =
      `${HOME_URL}/api/auth/mobile-webview-session?token=${encodeURIComponent(ticket)}`;

    const safeSessionUrl =
      sessionUrl.replace(
        /token=[^&]+/i,
        'token=[REDACTED]'
      );

    console.log(
      'WEBVIEW SESSION URL:',
      safeSessionUrl
    );

    // ----------------------------------------------------
    // IMPORTANT:
    //
    // WebViewComponent uses pendingUrl as its source.
    //
    // Setting this here prevents the WebView from simply
    // opening /home before the Passport session exists.
    // ----------------------------------------------------

    setPendingUrl(sessionUrl);

  },
  []
);


  // ========================================================
  // CLEAR RESTORE TICKET
  // ========================================================

  const clearRestoreTicket =
    useCallback(
      () => {

        console.log(
          'CLEARING WEBVIEW RESTORE TICKET'
        );


        setRestoreTicketState(
          null
        );

      },
      []
    );


  // ========================================================
  // NAVIGATE
  // ========================================================

  const navigate =
    useCallback(
      (
        path: string
      ) => {

        if (!path) {
          return;
        }


        const targetUrl =
          path.startsWith('http')
            ? path
            : `${HOME_URL}${path}`;


        /*
        --------------------------------------------------
        Protect sensitive query parameters in logs.
        --------------------------------------------------
        */

        const safeUrl =
          targetUrl
            .replace(
              /token=[^&]+/i,
              'token=[REDACTED]'
            )
            .replace(
              /ticket=[^&]+/i,
              'ticket=[REDACTED]'
            );


        console.log(
          'WebView navigate to:',
          path
        );


        console.log(
          'Resolved URL:',
          safeUrl
        );


        // ------------------------------------------------
        // WEBVIEW NOT READY
        // ------------------------------------------------

        if (!webViewRef.current) {

          console.log(
            'WebView not ready, storing pending URL:',
            safeUrl
          );


          setPendingUrl(
            targetUrl
          );


          return;

        }


        // ------------------------------------------------
        // WEBVIEW READY
        // ------------------------------------------------

        console.log(
          'WebView ready, navigating to:',
          safeUrl
        );


        webViewRef.current.injectJavaScript(`

          window.location.replace(
            ${JSON.stringify(targetUrl)}
          );

          true;

        `);

      },
      []
    );


  // ========================================================
  // CLEAR PENDING URL
  // ========================================================

  const clearPendingUrl =
    useCallback(
      () => {

        console.log(
          'CLEARING PENDING WEBVIEW URL'
        );


        setPendingUrl(
          null
        );

      },
      []
    );


  // ========================================================
  // JAVASCRIPT
  // ========================================================

  const injectJavaScript =
    useCallback(
      (
        script: string
      ) => {

        if (
          !webViewRef.current
        ) {

          console.log(
            'Cannot inject JavaScript: WebView not ready'
          );

          return;

        }


        webViewRef.current
          .injectJavaScript(
            script
          );

      },
      []
    );


  // ========================================================
  // RELOAD
  // ========================================================

  const reload =
    useCallback(
      () => {

        webViewRef.current
          ?.reload();

      },
      []
    );


  // ========================================================
  // GO BACK
  // ========================================================

  const goBack =
    useCallback(
      () => {

        webViewRef.current
          ?.goBack();

      },
      []
    );


  // ========================================================
  // CLEAR SESSION
  // ========================================================

  const clearSession =
    useCallback(
      async () => {

        console.log(
          'CLEARING WEBVIEW SESSION'
        );


        setCurrentPath(
          '/home'
        );


        setPendingUrl(
          null
        );


        /*
        --------------------------------------------------
        Clear any pending restore ticket.
        --------------------------------------------------
        */

        setRestoreTicketState(
          null
        );


        if (
          webViewRef.current
        ) {

          const homeUrl =
            `${HOME_URL}/home`;


          webViewRef.current
            .injectJavaScript(`

              window.location.replace(
                ${JSON.stringify(homeUrl)}
              );

              true;

            `);

        }

      },
      []
    );


  // ========================================================
  // CONTEXT VALUE
  // ========================================================

  const value:
    WebViewContextType = {

    navigate,

    reload,

    goBack,

    clearSession,

    setWebViewRef,

    currentPath,

    setCurrentPath,

    injectJavaScript,

    pendingUrl,

    clearPendingUrl,

    restoreTicket,

    setRestoreTicket,

    clearRestoreTicket,

  };


  // ========================================================
  // PROVIDER
  // ========================================================

  return (

    <WebViewContext.Provider
      value={value}
    >

      {children}

    </WebViewContext.Provider>

  );

};
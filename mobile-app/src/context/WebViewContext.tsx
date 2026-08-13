import React, { createContext, useContext, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';

const HOME_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}`;

type WebViewContextType = {
  navigate: (path: string) => void;
  reload: () => void;
  goBack: () => void;
  clearSession: () => void;
  setWebViewRef: (ref: WebView | null) => void;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  injectJavaScript: (script: string) => void;
  pendingUrl: string | null;
  clearPendingUrl: () => void;
};

const WebViewContext = createContext<WebViewContextType | undefined>(undefined);

export const useWebView = () => {
  const ctx = useContext(WebViewContext);
  if (!ctx) throw new Error('useWebView must be used within WebViewProvider');
  return ctx;
};

export const WebViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const webViewRef = useRef<WebView | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('/home');
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const setWebViewRef = (ref: WebView | null) => {
    webViewRef.current = ref;
  };

  const navigate = (path: string) => {
    if (!path) return;
    console.log('WebView navigate to', path);
    // Determine full URL
    const targetUrl = path.startsWith('http') ? path : `${HOME_URL}${path}`;
    // If WebView not mounted yet, store pending URL; otherwise inject navigation directly
    if (!webViewRef.current) {
      console.log('WebView not ready, storing pending URL:', targetUrl);
      setPendingUrl(targetUrl);
    } else {
      console.log('WebView ready, injecting navigation to:', targetUrl);
      webViewRef.current.injectJavaScript(`
        window.location.href = ${JSON.stringify(targetUrl)};
        true;
      `);
    }
  };

  const clearPendingUrl = () => {
    setPendingUrl(null);
  };

  const injectJavaScript = (script: string) => {
    webViewRef.current?.injectJavaScript(script);
  };

  const reload = () => {
    webViewRef.current?.reload();
  };

  const goBack = () => {
    webViewRef.current?.goBack();
  };

  const clearSession = async () => {
    setCurrentPath('/home');
    if (webViewRef.current) {
      const safeHomeUrl = JSON.stringify(`${HOME_URL}/home`);
      webViewRef.current.injectJavaScript(`
        window.location.replace(${safeHomeUrl});
        true;
      `);
    }
    // Cookie manager cleared - removed as unnecessary
  };

  const value: WebViewContextType = {
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
  };

  return (
    <WebViewContext.Provider value={value}>
      {children}
    </WebViewContext.Provider>
  );
};

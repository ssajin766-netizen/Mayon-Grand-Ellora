// src/screens/WebDashboardScreen.tsx

import React, { useEffect } from 'react';
import WebViewComponent from '../components/WebViewComponent';
import { useWebView } from '../context/WebViewContext';

interface Props {
  route: {
    params?: {
      initialPath?: string;
    };
  };
}

const WebDashboardScreen: React.FC<Props> = ({ route }) => {
  const { navigate } = useWebView();

  const initialPath = route?.params?.initialPath || '/home';

  useEffect(() => {
    navigate(initialPath);
  }, [initialPath]);

  return <WebViewComponent />;
};

export default WebDashboardScreen;

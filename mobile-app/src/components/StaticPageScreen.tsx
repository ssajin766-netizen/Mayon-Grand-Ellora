import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { fetchStaticPage } from '../services/api';
import { aboutHtml, privacyHtml, termsHtml } from '../../assets/static/fallbackContent';

type PageKey = 'about' | 'privacy' | 'terms';

interface Props {
  pageKey: PageKey;
}

const fallbackMap: Record<PageKey, string> = {
  about: aboutHtml,
  privacy: privacyHtml,
  terms: termsHtml,
};

const StaticPageScreen: React.FC<Props> = ({ pageKey }) => {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      try {
        const response = await fetchStaticPage(pageKey);
        if (isMounted) {
          setHtml(response.data);
        }
      } catch (e: any) {
        // fallback to bundled content
        if (isMounted) {
          setHtml(fallbackMap[pageKey]);
          setError(e.message || 'Failed to load content');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadContent();
    return () => {
      isMounted = false;
    };
  }, [pageKey]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView originWhitelist={["*"]} source={{ html }} style={styles.webview} />
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Error loading content. Showing fallback.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  loadingText: { color: '#fff', marginTop: 8 },
  errorBox: { padding: 8, backgroundColor: '#b71c1c' },
  errorText: { color: '#fff', textAlign: 'center' },
});

export default StaticPageScreen;

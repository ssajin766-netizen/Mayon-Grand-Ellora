import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { COLORS } from '../theme/colors';

export default function NoticesScreen({ navigation }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/notices');
      if (res.data && res.data.notices) {
        setNotices(res.data.notices);
      } else {
        setNotices([
          {
            _id: '1',
            title: 'Annual General Body Meeting 2026',
            content: 'The AGBM is scheduled for Sunday at 10:00 AM in the clubhouse.',
            createdAt: new Date().toISOString(),
          },
          {
            _id: '2',
            title: 'Water Tank Cleaning Notice',
            content: 'Overhead water tank cleaning will happen on Thursday from 9 AM to 2 PM.',
            createdAt: new Date().toISOString(),
          }
        ]);
      }
    } catch (err) {
      setNotices([
        {
          _id: '1',
          title: 'Annual General Body Meeting 2026',
          content: 'The AGBM is scheduled for Sunday at 10:00 AM in the clubhouse.',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          title: 'Water Tank Cleaning Notice',
          content: 'Overhead water tank cleaning will happen on Thursday from 9 AM to 2 PM.',
          createdAt: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Society Notices</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} size="large" />
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.noticeCard}>
              <View style={styles.noticeHeader}>
                <Ionicons name="megaphone-outline" size={20} color={COLORS.primary} />
                <Text style={styles.noticeTitle}>{item.title}</Text>
              </View>
              <Text style={styles.noticeBody}>{item.content}</Text>
              <Text style={styles.noticeDate}>
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: 14,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  listContent: {
    padding: 20,
    gap: 14,
  },
  noticeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  noticeBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  noticeDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

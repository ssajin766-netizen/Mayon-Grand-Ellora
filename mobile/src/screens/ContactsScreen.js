import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export default function ContactsScreen({ navigation }) {
  const contacts = [
    { title: 'Security Gate Office', phone: '022-12345678', icon: 'shield-outline', color: '#10B981' },
    { title: 'Police Station', phone: '100', icon: 'call-outline', color: '#EF4444' },
    { title: 'Ambulance Emergency', phone: '102', icon: 'medical-outline', color: '#F59E0B' },
    { title: 'Society Electrician', phone: '+91 98765 11111', icon: 'flash-outline', color: '#4F46E5' },
    { title: 'Society Plumber', phone: '+91 98765 22222', icon: 'water-outline', color: '#06B6D4' },
    { title: 'Lift Repair Service', phone: '+91 98765 33333', icon: 'construct-outline', color: '#8B5CF6' },
  ];

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Phone Call', `Dialing ${phone}`);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {contacts.map((c, idx) => (
          <TouchableOpacity key={idx} style={styles.card} onPress={() => handleCall(c.phone)}>
            <View style={[styles.iconCircle, { backgroundColor: c.color + '15' }]}>
              <Ionicons name={c.icon} size={24} color={c.color} />
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.title}>{c.title}</Text>
              <Text style={styles.phone}>{c.phone}</Text>
            </View>
            <Ionicons name="call" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  phone: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

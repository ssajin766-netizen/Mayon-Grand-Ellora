import React, { useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const modules = [
    {
      id: 'notices',
      title: 'Society Notices',
      subtitle: 'View announcements & updates',
      icon: 'megaphone',
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      screen: 'Notices',
    },
    {
      id: 'bills',
      title: 'Maintenance Bills',
      subtitle: 'Download & pay monthly bills',
      icon: 'receipt',
      color: '#10B981',
      bgColor: '#ECFDF5',
      screen: 'Bills',
    },
    {
      id: 'complaints',
      title: 'Complaints & Helpdesk',
      subtitle: 'Raise issues & track status',
      icon: 'chatbox-ellipses',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      screen: 'Complaints',
    },
    {
      id: 'contacts',
      title: 'Emergency Contacts',
      subtitle: 'Police, Electrician, Security',
      icon: 'call',
      color: '#EF4444',
      bgColor: '#FEE2E2',
      screen: 'Contacts',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Banner Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeLabel}>WELCOME BACK</Text>
            <Text style={styles.userName}>
              {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Resident'}
            </Text>
            <View style={styles.societyBadge}>
              <Ionicons name="home" size={14} color={COLORS.primary} />
              <Text style={styles.societyText}>
                {user?.societyName && user?.societyName !== 'Pending'
                  ? `${user.societyName} (Flat ${user.flatNumber || '-'})`
                  : 'Mayon Grand Ellora'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle" size={44} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Action Grid */}
        <Text style={styles.sectionTitle}>Dashboard Services</Text>
        <View style={styles.grid}>
          {modules.map((mod) => (
            <TouchableOpacity
              key={mod.id}
              style={styles.card}
              onPress={() => navigation.navigate(mod.screen)}
            >
              <View style={[styles.iconContainer, { backgroundColor: mod.bgColor }]}>
                <Ionicons name={mod.icon} size={28} color={mod.color} />
              </View>
              <Text style={styles.cardTitle}>{mod.title}</Text>
              <Text style={styles.cardSubtitle}>{mod.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status Banner */}
        <View style={styles.statusCard}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>Account Status: Verified</Text>
            <Text style={styles.statusDesc}>
              Logged in via {user?.phoneNumber ? 'Phone OTP' : 'Google Auth'}
            </Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutMiniBtn}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  welcomeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: 2,
  },
  societyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  societyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  profileBtn: {
    paddingLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  grid: {
    gap: 14,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  logoutMiniBtn: {
    padding: 8,
  },
});

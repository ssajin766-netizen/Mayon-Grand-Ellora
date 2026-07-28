import React, { useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out from Mayon Grand Ellora?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={54} color={COLORS.primary} />
          </View>
          <Text style={styles.name}>
            {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'User'}
          </Text>
          <Text style={styles.email}>{user?.username || ''}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Details</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoVal}>{user?.phoneNumber || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Society Name</Text>
              <Text style={styles.infoVal}>{user?.societyName || 'Mayon Grand Ellora'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="home-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Flat Number</Text>
              <Text style={styles.infoVal}>{user?.flatNumber || 'Not assigned'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Approval Status</Text>
              <Text style={styles.infoValCapitalized}>{user?.validation || 'Applied'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Logout from Mobile App</Text>
        </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    gap: 14,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoVal: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  infoValCapitalized: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  logoutBtn: {
    height: 52,
    backgroundColor: COLORS.error,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

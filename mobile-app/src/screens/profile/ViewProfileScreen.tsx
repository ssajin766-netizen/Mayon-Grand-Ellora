import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProfile, resetProfileState } from '../../store/profileSlice';
import { useNavigation } from '@react-navigation/native';
import { performLogout } from '../../utils/logout';
import { Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import SkeletonCard from '../../components/SkeletonCard';
import FadeInView from '../../components/FadeInView';

const ViewProfileScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>(); // TODO: Replace with strongly typed navigation params after TS stabilization.
  const { data, loading, error } = useAppSelector(state => state.profile);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleLogout = async () => {
    await performLogout(dispatch, navigation);
  };

  if (loading && !data) {
    // TODO: Replace with skeleton loader component for premium UI
    return (
      <View style={styles.centered}><Text>Loading profile...</Text></View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}><Text style={styles.error}>Error: {error}</Text></View>
    );
  }

  if (!data) return null;

  const {
    firstName,
    lastName,
    phone,
    email,
    societyName,
    block,
    flat,
    residentId,
    role,
    accountStatus,
    memberSince,
    avatarUrl,
  } = data;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
    >
      <View style={styles.avatarWrapper}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <Avatar.Icon size={120} icon="account" />
        )}
        <TouchableOpacity style={styles.editAvatarBtn} onPress={() => navigation.navigate('ChangePhoto')}>
          <MaterialCommunityIcons name="camera" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.name}>{firstName} {lastName}</Text>
        <Text>Phone: {phone}</Text>
        <Text>Email: {email}</Text>
        <Text>Society: {societyName}</Text>
        <Text>Block/Tower: {block}</Text>
        <Text>Flat/Unit: {flat}</Text>
        {residentId && <Text>Resident ID: {residentId}</Text>}
        <Text>Role: {role}</Text>
        <Text>Account Status: {accountStatus}</Text>
        <Text>Member Since: {new Date(memberSince).toLocaleDateString()}</Text>
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('EditProfile')}>
          <MaterialCommunityIcons name="account-edit" size={24} color="#fff" />
          <Text style={styles.actionText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Security')}> {/* placeholder */}
          <MaterialCommunityIcons name="shield-lock" size={24} color="#fff" />
          <Text style={styles.actionText}>Security</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Notifications')}> {/* placeholder */}
          <MaterialCommunityIcons name="bell" size={24} color="#fff" />
          <Text style={styles.actionText}>Notifications</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AboutApp')}>
          <MaterialCommunityIcons name="information" size={24} color="#fff" />
          <Text style={styles.actionText}>About App</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <MaterialCommunityIcons name="lock" size={24} color="#fff" />
          <Text style={styles.actionText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Terms') }>
          <MaterialCommunityIcons name="file-document" size={24} color="#fff" />
          <Text style={styles.actionText}>Terms & Conditions</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red' },
  avatarWrapper: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0008',
    borderRadius: 20,
    padding: 6,
  },
  infoBox: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, marginBottom: 20 },
  name: { fontSize: 22, fontWeight: '600', marginBottom: 8, color: '#fff' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  actionBtn: { alignItems: 'center', backgroundColor: '#0005', padding: 12, borderRadius: 8, width: 100 },
  actionText: { color: '#fff', marginTop: 4, fontSize: 12, textAlign: 'center' },
  logoutSection: { alignItems: 'center', marginTop: 20 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#b00020', padding: 12, borderRadius: 8 },
  logoutText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
});

export default ViewProfileScreen;

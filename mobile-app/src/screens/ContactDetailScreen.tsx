// src/screens/ContactDetailScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootState } from '../store';
import {
  selectContactById,
  selectEmergencyLoading,
  selectEmergencyError,
  toggleContactEnabled,
  deleteEmergencyContact,
} from '../store/emergencyContactsSlice';
import { useAuthRole } from '../store/auth';
import GlassCard from '../components/GlassCard';
import { CategoryChip } from '../components/CategoryChip';
import { QuickActionButton } from '../components/QuickActionButton';
import EmptyStateView from '../components/EmptyStateView';

type DetailRouteParams = {
  ContactDetail: { contactId: string };
};

type DetailRouteProp = RouteProp<DetailRouteParams, 'ContactDetail'>;

const ContactDetailScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<DetailRouteProp>();
  const { contactId } = route.params;

  const role = useAuthRole();
  const isAdmin = role === 'admin';

  const contact = useAppSelector((state: RootState) => selectContactById(state, contactId));
  const loading = useAppSelector(selectEmergencyLoading);
  const error = useAppSelector(selectEmergencyError);

  // Fade‑in animation when component mounts or contact changes
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [contact]);

  const handleCall = () => {
    if (contact?.phone) {
      Linking.openURL(`tel:${contact.phone}`);
    }
  };

  const handleEmail = () => {
    if (contact?.email) {
      Linking.openURL(`mailto:${contact.email}`);
    }
  };

  const handleMaps = () => {
    if (contact?.address) {
      const query = encodeURIComponent(contact.address);
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      Linking.openURL(url);
    }
  };

  const handleToggle = () => {
    if (contact) {
      dispatch(toggleContactEnabled({ id: contact.id, enabled: !contact.enabled }));
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditContact', { contactId: contact?.id });
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (contact) {
              dispatch(deleteEmergencyContact(contact.id));
              navigation.goBack();
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  if (loading && !contact) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error && !contact) {
    return (
      <EmptyStateView title="Unable to load contact" description={error as string} onRetry={() => navigation.navigate('ContactList')} />
    );
  }

  if (!contact) {
    return (
      <EmptyStateView title="Contact not found" description="The requested emergency contact could not be found." />
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <GlassCard style={styles.card}>
        <Text style={styles.name}>{contact.name}</Text>
        <CategoryChip category={contact.category} />
        <Text style={styles.info}>Phone: {contact.phone}</Text>
        {contact.email && <Text style={styles.info}>Email: {contact.email}</Text>}
        {contact.address && <Text style={styles.info}>Address: {contact.address}</Text>}
        <View style={styles.actionsRow}>
          <QuickActionButton icon="phone" label="Call" onPress={handleCall} disabled={loading} />
          {contact.email && <QuickActionButton icon="mail" label="Email" onPress={handleEmail} disabled={loading} />}
          {contact.address && <QuickActionButton icon="map" label="Maps" onPress={handleMaps} disabled={loading} />}
        </View>
        {isAdmin && (
          <View style={styles.adminRow}>
            <TouchableOpacity style={styles.adminButton} onPress={handleEdit}>
              <Text style={styles.adminButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adminButtonDelete} onPress={confirmDelete}>
              <Text style={styles.adminButtonText}>Delete</Text>
            </TouchableOpacity>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Enabled</Text>
              <Switch value={contact.enabled} onValueChange={handleToggle} disabled={loading} />
            </View>
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', padding: 12 },
  card: { padding: 20 },
  name: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 8 },
  info: { fontSize: 16, color: '#ddd', marginBottom: 4 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
  adminRow: { marginTop: 20, alignItems: 'center' },
  adminButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  adminButtonDelete: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  adminButtonText: { color: '#fff', fontWeight: '600' },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  toggleLabel: { color: '#fff', marginRight: 6 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ContactDetailScreen;

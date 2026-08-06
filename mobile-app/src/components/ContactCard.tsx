import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Linking } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootState } from '../store';
import { toggleContactEnabled, selectEmergencyLoading } from '../store/emergencyContactsSlice';
import GlassCard from './GlassCard';
import { CategoryChip } from './CategoryChip';
import { QuickActionButton } from './QuickActionButton';

interface ContactCardProps {
  contact: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    category: string;
    enabled: boolean;
    [key: string]: any;
  };
  isAdmin: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, isAdmin }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectEmergencyLoading);

  const handleToggle = () => {
    if (!loading) {
      dispatch(toggleContactEnabled({ id: contact.id, enabled: !contact.enabled }));
    }
  };

  const handleCall = () => {
    Linking.openURL(`tel:${contact.phone}`);
  };

  const handleEmail = () => {
    if (contact.email) {
      Linking.openURL(`mailto:${contact.email}`);
    }
  };

  const handleMaps = () => {
    if (contact.address) {
      const query = encodeURIComponent(contact.address);
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      Linking.openURL(url);
    }
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{contact.name}</Text>
        <CategoryChip category={contact.category} />
        <Text style={styles.phone}>{contact.phone}</Text>
        {contact.email && <Text style={styles.email}>📧 {contact.email}</Text>}
        {contact.address && <Text style={styles.address}>📍 {contact.address}</Text>}
      </View>
      <View style={styles.actionsContainer}>
        <QuickActionButton icon="phone" label="Call" onPress={handleCall} disabled={loading} />
        {contact.email && (
          <QuickActionButton icon="mail" label="Email" onPress={handleEmail} disabled={loading} />
        )}
        {contact.address && (
          <QuickActionButton icon="map" label="Maps" onPress={handleMaps} disabled={loading} />
        )}
        {isAdmin && (
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Enabled</Text>
            <Switch
              value={contact.enabled}
              onValueChange={handleToggle}
              disabled={loading}
            />
          </View>
        )}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    padding: 16,
    flexDirection: 'column',
  },
  infoContainer: {
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 2,
  },
  address: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#fff',
    marginRight: 6,
    fontSize: 14,
  },
});

export default ContactCard;

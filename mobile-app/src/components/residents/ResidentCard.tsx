// src/components/residents/ResidentCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import GlassCard from '../../components/GlassCard';
import ResidentAvatar from './ResidentAvatar';
import ResidentStatusChip from './ResidentStatusChip';
import { Resident } from '../../types/resident';

interface ResidentCardProps {
  resident: Resident;
  onPress?: () => void;
}

const ResidentCard: React.FC<ResidentCardProps> = ({ resident, onPress }) => {
  const theme = useTheme();
  const fullName = `${resident.firstName ?? ''} ${resident.lastName ?? ''}`.trim();
  const flat = resident.unitNumber ?? '';
  const phone = resident.phone ?? '';
  const type = resident.category ?? '';
  const status = resident.status ?? 'Inactive';

  return (
    <TouchableOpacity testID="resident-card-touchable" onPress={onPress} disabled={!onPress} activeOpacity={0.8} style={styles.touchable}>
      <GlassCard style={styles.card}>
        <View style={styles.container}>
          <ResidentAvatar name={fullName} size={56} />
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.colors.onSurface }]}>{fullName}</Text>
            <Text style={[styles.details, { color: theme.colors.onSurfaceVariant }]}>{`Flat: ${flat}`}</Text>
            <Text style={[styles.details, { color: theme.colors.onSurfaceVariant }]}>{`Phone: ${phone}`}</Text>
            <Text style={[styles.details, { color: theme.colors.onSurfaceVariant }]}>{`Type: ${type}`}</Text>
          </View>
          <ResidentStatusChip status={status} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: { marginVertical: 8 },
  card: { padding: 12 },
  container: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  details: { fontSize: 13, marginTop: 2 },
});

export default ResidentCard;

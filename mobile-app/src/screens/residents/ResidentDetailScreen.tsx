// src/screens/residents/ResidentDetailScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGetResidentQuery, useDeleteResidentMutation } from '../../store/residentApi';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassModal from '../../components/GlassModal';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ResidentAvatar from '../../components/residents/ResidentAvatar';
import ResidentStatusChip from '../../components/residents/ResidentStatusChip';
import { showSuccess, showError } from '../../services/toast';
import { Resident } from '../../types/resident';

const ResidentDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { residentId } = route.params as { residentId: string };

  const {
    data,
    error,
    isLoading,
    refetch,
    isError,
  } = useGetResidentQuery(residentId);

  const [deleteResident] = useDeleteResidentMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDelete = async () => {
    try {
      await deleteResident(residentId).unwrap();
      showSuccess('Resident deleted');
      navigation.goBack();
    } catch (e) {
      showError('Failed to delete resident');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return <LoadingSkeleton type="card" count={1} />;
  }

  if (isError) {
    // Show inline error with retry and toast
    showError('Unable to load resident');
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load resident.</Text>
        <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const resident: Resident | undefined = data?.resident;

  if (!resident) {
    return (
      <EmptyState
        title="Resident Not Found"
        description="The requested resident does not exist."
        actionTitle="Back"
        onAction={() => navigation.goBack()}
      />
    );
  }

  const fullName = `${resident.firstName ?? ''} ${resident.lastName ?? ''}`.trim();

  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <ResidentAvatar name={fullName} size={80} />
          <Text style={[styles.name, { color: '#fff' }]}>{fullName}</Text>
          <Text style={[styles.role, { color: '#ccc' }]}>{resident.category}</Text>
          <ResidentStatusChip status={resident.status ?? 'Inactive'} />
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{resident.phone}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{resident.email ?? '-'}</Text>

          <Text style={styles.label}>Flat / Unit</Text>
          <Text style={styles.value}>{resident.unitNumber}</Text>

          {/* Add more fields as needed */}
        </View>
        <View style={styles.actions}>
          <GlassButton
            title="Edit Resident"
            variant="secondary"
            onPress={() =>
              navigation.navigate('ResidentForm' as any, { mode: 'edit', residentId })
            }
            style={styles.actionButton}
          />
          <GlassButton
            title="Delete Resident"
            variant="danger"
            onPress={() => setShowDeleteModal(true)}
            style={styles.actionButton}
          />
        </View>
      </GlassCard>

      {/* Delete Confirmation Modal */}
      <GlassModal
        visible={showDeleteModal}
        title="Delete Resident"
        message={`Are you sure you want to delete ${fullName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 12 },
  card: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 16 },
  name: { marginTop: 8, fontSize: 20, fontWeight: '600' },
  role: { fontSize: 16, marginTop: 4 },
  infoSection: { marginTop: 12 },
  label: { color: '#aaa', fontSize: 13, marginTop: 8 },
  value: { color: '#fff', fontSize: 15 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  actionButton: { flex: 0.48 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#ff6b6b', fontSize: 16, marginBottom: 12 },
  retryButton: { backgroundColor: '#ff8c00', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  retryButtonText: { color: '#fff', fontWeight: '600' },
});

export default ResidentDetailScreen;

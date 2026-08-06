// src/screens/residents/ResidentListScreen.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGetResidentsQuery } from '../../store/residentApi';
import SearchBar from '../../components/SearchBar';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ResidentCard from '../../components/residents/ResidentCard';
import GlassButton from '../../components/GlassButton';
import { showError } from '../../services/toast';
import { Resident } from '../../types/resident';

const ResidentListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');

  const { data, error, isLoading, refetch, isFetching, isError } = useGetResidentsQuery(undefined, {
    // No args for the basic list; pagination can be added later
    // Provide a stable refetch for pull‑to‑refresh
    refetchOnMountOrArgChange: true,
  });

  const residents: Resident[] = data?.residents ?? [];

  const filteredResidents = useMemo(() => {
    if (!search) return residents;
    const lower = search.toLowerCase();
    return residents.filter((r) => {
      const fullName = `${r.firstName ?? ''} ${r.lastName ?? ''}`.toLowerCase();
      return fullName.includes(lower);
    });
  }, [residents, search]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Show toast on error (once)
  if (isError && error) {
    // error may be of unknown shape; we just display generic message
    showError('Failed to load residents');
  }

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton type="card" count={8} />;
    }

    if (isError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load residents.</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredResidents.length === 0) {
      return (
        <EmptyState
          title="No Residents"
          description="Add your first resident to get started."
          actionTitle="Add Resident"
          onAction={() => navigation.navigate('ResidentForm' as any, { mode: 'create' })}
        />
      );
    }

    return (
      <FlatList
        data={filteredResidents}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ResidentCard
            resident={item}
            onPress={() => navigation.navigate('ResidentDetail' as any, { residentId: item._id })}
          />
        )}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <View style={styles.container}>
      <SearchBar placeholder="Search residents..." onChangeText={setSearch} />
      {renderContent()}
      <GlassButton
        onPress={() => navigation.navigate('ResidentForm' as any, { mode: 'create' })}
        style={styles.fab}
        title="+"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  listContent: { paddingHorizontal: 12, paddingTop: 12 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    // GlassButton already has its own styling; we only need positioning
  },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#ff6b6b', fontSize: 16, marginBottom: 12 },
  retryButton: { backgroundColor: '#ff8c00', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  retryButtonText: { color: '#fff', fontWeight: '600' },
});

export default ResidentListScreen;

// src/screens/ContactListScreen.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, TextInput, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootState } from '../store';
import {
  fetchEmergencyContacts,
  fetchEmergencyCategoriesThunk,
  selectAllContacts,
  selectEmergencyLoading,
  selectEmergencyError,
  selectEmergencyCategories,
  selectEmergencyLoading as selectLoading,
} from '../store/emergencyContactsSlice';
import ContactCard from '../components/ContactCard';
import EmptyStateView from '../components/EmptyStateView';
import SkeletonCard from '../components/SkeletonCard';
import { useAuthRole } from '../store/auth'; // hook that returns current role string ('admin' | 'user')

// Floating add button style (simple circular button)
const AddButton: React.FC<{ onPress: () => void; testID?: string }> = ({ onPress, testID }) => (
  <TouchableOpacity onPress={onPress} style={styles.addButton} activeOpacity={0.8} testID={testID}>
    <Text style={styles.addButtonText}>+</Text>
  </TouchableOpacity>
);

const ContactListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<any>>();
  const role = useAuthRole();
  const isAdmin = role === 'admin';

  const contacts = useAppSelector(selectAllContacts);
  const categories = useAppSelector(selectEmergencyCategories);
  const loading = useAppSelector(selectEmergencyLoading);
  const error = useAppSelector(selectEmergencyError);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Debounce logic for search input
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Just trigger a re‑render; actual filter is applied in render
    }, 300);
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchesCategory = selectedCategory ? c.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const loadData = useCallback(async () => {
    await Promise.all([
      dispatch(fetchEmergencyCategoriesThunk()),
      dispatch(fetchEmergencyContacts()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <ContactCard contact={item} isAdmin={isAdmin} />
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[...Array(5)].map((_, i) => (
        <SkeletonCard key={i} style={styles.skeletonCard} />
      ))}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TextInput
        placeholder="Search contacts…"
        placeholderTextColor="#888"
        value={search}
        onChangeText={handleSearchChange}
        style={styles.searchInput}
      />
      {/* Simple category selector – could be a Picker or custom dropdown */}
      {categories.length > 0 && (
        <View style={styles.categoryFilter}>
          <Text style={styles.filterLabel}>Category:</Text>
          <TouchableOpacity
            onPress={() => {
              // Cycle through categories for demo purpose
              const currentIdx = categories.indexOf(selectedCategory);
              const nextIdx = (currentIdx + 1) % categories.length;
              setSelectedCategory(categories[nextIdx]);
            }}
            style={styles.filterButton}
          >
            <Text style={styles.filterButtonText}>
              {selectedCategory || 'All'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const handleAddPress = () => {
    navigation.navigate('AddContact'); // route name must exist in navigation stack
  };

  if (loading && contacts.length === 0) {
    return renderSkeleton();
  }

  if (error && contacts.length === 0) {
    return (
      <EmptyStateView
        title="Unable to load contacts"
        description={error as string}
        onRetry={loadData}
      />
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {filteredContacts.length === 0 ? (
        <EmptyStateView
          title="No contacts found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
        />
      )}
      {isAdmin && <AddButton onPress={handleAddPress} testID="addButton" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  headerContainer: { padding: 12, flexDirection: 'row', alignItems: 'center' },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  categoryFilter: { marginLeft: 12, flexDirection: 'row', alignItems: 'center' },
  filterLabel: { color: '#fff', marginRight: 6 },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterButtonText: { color: '#fff' },
  listContent: { paddingHorizontal: 12, paddingBottom: 80 },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#ff5a5f',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addButtonText: { color: '#fff', fontSize: 28, lineHeight: 28 },
  skeletonContainer: { padding: 12 },
  skeletonCard: { marginBottom: 12 },
});

export default ContactListScreen;

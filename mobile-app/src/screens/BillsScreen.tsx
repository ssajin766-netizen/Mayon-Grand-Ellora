import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';

interface Bill {
  id: string;
  billNumber: string;
  residentName: string;
  unitNumber: string;
  period: string; // e.g., "Jan 2024"
  dueDate: string; // ISO string
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Pending';
}

const BillsScreen = () => {
  const navigation = useNavigation<any>();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const fetchBills = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/bills'); // backend returns list
      setBills(resp.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBills();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchBills();
  }, []);

  const filteredBills = bills.filter(b => {
    const matchesSearch =
      b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.residentName.toLowerCase().includes(search.toLowerCase()) ||
      b.unitNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const renderItem = ({ item }: { item: Bill }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('BillDetail', { billId: item.id })}>
      <View style={styles.row}>
        <Text style={styles.title}>#{item.billNumber}</Text>
        <Chip style={styles.chip} textStyle={styles.chipText}>{item.status}</Chip>
      </View>
      <Text style={styles.info}>Resident: {item.residentName} ({item.unitNumber})</Text>
      <Text style={styles.info}>Period: {item.period}</Text>
      <Text style={styles.info}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
      <Text style={styles.amount}>₹ {item.amount.toFixed(2)}</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search bills..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <View style={styles.filterRow}>
          {['All', 'Paid', 'Unpaid', 'Pending'].map(s => (
            <TouchableOpacity key={s} onPress={() => setFilterStatus(s)}>
              <Text style={[styles.filterText, filterStatus === s && styles.filterActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredBills}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 10 },
  card: { marginVertical: 6, backgroundColor: '#1e1e1e', padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#ff8c00', fontSize: 18, fontWeight: 'bold' },
  chip: { backgroundColor: '#333' },
  chipText: { color: '#fff' },
  info: { color: '#fff', marginTop: 4 },
  amount: { color: '#ff8c00', marginTop: 8, fontSize: 16, fontWeight: '600' },
  searchContainer: { marginBottom: 10 },
  searchInput: { backgroundColor: '#1e1e1e', color: '#fff', padding: 8, borderRadius: 8 },
  filterRow: { flexDirection: 'row', marginTop: 8, justifyContent: 'space-around' },
  filterText: { color: '#888' },
  filterActive: { color: '#ff8c00', fontWeight: 'bold' },
});

export default BillsScreen;

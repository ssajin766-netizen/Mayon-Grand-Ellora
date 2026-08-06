import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';

interface Bill {
  id: string;
  billNumber: string;
  residentName: string;
  unitNumber: string;
  period: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Pending';
}

const AdminBillsScreen = () => {
  const navigation = useNavigation<any>();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/admin/bills');
      setBills(resp.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load admin bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBills();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this bill?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/bills/${id}`);
            Alert.alert('Deleted', 'Bill deleted successfully');
            fetchBills();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete bill');
          }
        },
      },
    ]);
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await api.post(`/admin/bills/${id}/mark-paid`);
      Alert.alert('Success', 'Bill marked as paid');
      fetchBills();
    } catch (e) {
      Alert.alert('Error', 'Unable to mark as paid');
    }
  };

  const renderItem = ({ item }: { item: Bill }) => (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>#{item.billNumber}</Text>
        <Chip style={styles.chip} textStyle={styles.chipText}>{item.status}</Chip>
      </View>
      <Text style={styles.info}>Resident: {item.residentName} ({item.unitNumber})</Text>
      <Text style={styles.info}>Period: {item.period}</Text>
      <Text style={styles.info}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
      <Text style={styles.amount}>₹ {item.amount.toFixed(2)}</Text>
      <View style={styles.actions}>
        <Button mode="text" onPress={() => navigation.navigate('EditBill', { billId: item.id })}>Edit</Button>
        <Button mode="text" onPress={() => handleDelete(item.id)}>Delete</Button>
        {item.status !== 'Paid' && (
          <Button mode="text" onPress={() => handleMarkPaid(item.id)}>Mark Paid</Button>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topButtons}>
        <Button mode="contained" onPress={() => navigation.navigate('CreateBill')} style={styles.topBtn}>Create New Bill</Button>
        <Button mode="outlined" onPress={() => navigation.navigate('PaymentReports')} style={styles.topBtn}>Payment Reports</Button>
        <Button mode="outlined" onPress={() => navigation.navigate('BulkGenerateBills')} style={styles.topBtn}>Bulk Generate</Button>
      </View>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={bills}
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
  title: { color: '#ff8c00', fontSize: 16, fontWeight: 'bold' },
  chip: { backgroundColor: '#333' },
  topButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  topBtn: { flex: 1, marginHorizontal: 4 },
  chipText: { color: '#fff' },
  info: { color: '#fff', marginTop: 4 },
  amount: { color: '#ff8c00', marginTop: 8, fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  createBtn: { marginBottom: 12 },
});

export default AdminBillsScreen;

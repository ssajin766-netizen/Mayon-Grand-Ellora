import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Card, Chip, Button } from 'react-native-paper';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';

interface Payment {
  id: string;
  billNumber: string;
  amount: number;
  status: 'Success' | 'Failed' | 'Pending';
  paymentDate: string; // ISO
  method: string; // e.g., 'Card', 'UPI'
  transactionId: string;
}

const PaymentHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/payments/history');
      setPayments(resp.data);
    } catch (e) {
      Alert.alert('Error', 'Unable to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  }, []);

  const filtered = payments.filter(p =>
    p.billNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.transactionId.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadBillPdf = (billNumber: string) => {
    const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/bills/${billNumber}/pdf`;
    navigation.navigate('BillDetail', { billId: billNumber }); // reuse detail view's download
  };

  const handleDownloadReceipt = (paymentId: string) => {
    const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/payments/${paymentId}/receipt`;
    // Use expo-file-system similar to BillDetail (omitted for brevity)
    Alert.alert('Download', 'Receipt download implementation placeholder');
  };

  const renderItem = ({ item }: { item: Payment }) => (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>Bill #{item.billNumber}</Text>
        <Chip style={styles.chip} textStyle={styles.chipText}>{item.status}</Chip>
      </View>
      <Text style={styles.info}>Amount: ₹ {item.amount.toFixed(2)}</Text>
      <Text style={styles.info}>Date: {new Date(item.paymentDate).toLocaleDateString()}</Text>
      <Text style={styles.info}>Method: {item.method}</Text>
      <Text style={styles.info}>Txn ID: {item.transactionId}</Text>
      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => handleDownloadBillPdf(item.billNumber)} style={styles.actionBtn}>Bill PDF</Button>
        <Button mode="outlined" onPress={() => handleDownloadReceipt(item.id)} style={styles.actionBtn}>Receipt</Button>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search payments..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filtered}
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
  chipText: { color: '#fff' },
  info: { color: '#fff', marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  actionBtn: { flex: 0.48 },
  searchInput: { backgroundColor: '#1e1e1e', color: '#fff', padding: 8, borderRadius: 8, marginBottom: 10 },
});

export default PaymentHistoryScreen;

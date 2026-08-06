import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Card, Chip, Button, TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import api from '../../services/api';
import { AntDesign } from '@expo/vector-icons';

const PaymentReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any>(null);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [resident, setResident] = useState('');
  const [status, setStatus] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (month) params.month = month;
      if (year) params.year = year;
      if (resident) params.resident = resident;
      if (status) params.status = status;
      const resp = await api.get('/admin/bills/reports', { params });
      setReports(resp.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const renderCard = (title: string, value: string | number) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Filters */}
      <View style={styles.filters}>
        <TextInput label="Resident" value={resident} onChangeText={setResident} style={styles.filterInput} />
        <Picker selectedValue={month} onValueChange={setMonth} style={styles.picker} prompt="Month">
          <Picker.Item label="All Months" value="" />
          {Array.from({ length: 12 }, (_, i) => (
            <Picker.Item key={i + 1} label={(i + 1).toString().padStart(2, '0')} value={(i + 1).toString().padStart(2, '0')} />
          ))}
        </Picker>
        <Picker selectedValue={year} onValueChange={setYear} style={styles.picker} prompt="Year">
          <Picker.Item label="All Years" value="" />
          {['2023', '2024', '2025', '2026'].map(y => (
            <Picker.Item key={y} label={y} value={y} />
          ))}
        </Picker>
        <Picker selectedValue={status} onValueChange={setStatus} style={styles.picker} prompt="Status">
          <Picker.Item label="All Status" value="" />
          <Picker.Item label="Paid" value="Paid" />
          <Picker.Item label="Unpaid" value="Unpaid" />
          <Picker.Item label="Pending" value="Pending" />
        </Picker>
        <Button mode="contained" onPress={fetchReports} style={styles.filterBtn}>Apply Filters</Button>
      </View>

      {/* Report Cards */}
      <View style={styles.cardsContainer}>
        {reports && (
          <>
            {renderCard('Total Bills Generated', reports.totalBills)}
            {renderCard('Total Amount Collected', `₹ ${reports.totalCollected.toFixed(2)}`)}
            {renderCard('Pending Payments', reports.pendingCount)}
            {renderCard('Overdue Bills', reports.overdueCount)}
            {renderCard('Monthly Collection', `₹ ${reports.monthlyCollected?.toFixed(2) ?? 0}`)}
            {renderCard('Yearly Collection', `₹ ${reports.yearlyCollected?.toFixed(2) ?? 0}`)}
            {renderCard('Resident‑wise Summary', reports.residentSummary?.length ? `${reports.residentSummary.length} residents` : '0')}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#111', padding: 12 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filters: { marginBottom: 16 },
  filterInput: { backgroundColor: '#2a2a2a', marginBottom: 8 },
  picker: { backgroundColor: '#2a2a2a', color: '#fff', marginBottom: 8 },
  filterBtn: { marginTop: 8 },
  cardsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#1e1e1e', width: '48%', marginBottom: 12 },
  cardContent: { padding: 12 },
  cardTitle: { color: '#fff', fontSize: 14 },
  cardValue: { color: '#ff8c00', fontSize: 18, fontWeight: '600', marginTop: 4 },
});

export default PaymentReportsScreen;

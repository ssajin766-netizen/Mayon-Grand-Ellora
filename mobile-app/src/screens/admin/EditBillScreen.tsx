import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Card, Chip } from 'react-native-paper';
import api from '../../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';

const EditBillScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { billId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [period, setPeriod] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [charges, setCharges] = useState(''); // JSON string
  const [status, setStatus] = useState<'Paid' | 'Unpaid' | 'Pending'>('Pending');

  const fetchBill = async () => {
    try {
      const resp = await api.get(`/admin/bills/${billId}`);
      const b = resp.data;
      setPeriod(b.period);
      setDueDate(b.dueDate?.split('T')[0] || '');
      setAmount(String(b.amount));
      setCharges(JSON.stringify(b.charges, null, 2));
      setStatus(b.status);
    } catch (e) {
      Alert.alert('Error', 'Failed to load bill data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, []);

  const handleSave = async () => {
    if (!period || !dueDate || !amount) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    let parsedCharges = [];
    try {
      parsedCharges = charges ? JSON.parse(charges) : [];
    } catch (e) {
      Alert.alert('Error', 'Charges must be valid JSON');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/admin/bills/${billId}`, {
        period,
        dueDate,
        amount: parseFloat(amount),
        charges: parsedCharges,
        status,
      });
      Alert.alert('Success', 'Bill updated');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to update bill');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Edit Bill #{billId}</Text>
        <TextInput placeholder="Period (e.g., Jan 2024)" value={period} onChangeText={setPeriod} style={styles.input} />
        <TextInput placeholder="Due Date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} style={styles.input} />
        <TextInput placeholder="Total Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} />
        <TextInput
          placeholder='Charges JSON [{"description":"Water","amount":200}]'
          value={charges}
          onChangeText={setCharges}
          style={[styles.input, { height: 100 }]}
          multiline
        />
        <View style={styles.statusRow}>
          <Text style={styles.label}>Status:</Text>
          <Chip style={styles.statusChip} onPress={() => setStatus(status === 'Paid' ? 'Unpaid' : status === 'Unpaid' ? 'Pending' : 'Paid')}>
            {status}
          </Chip>
        </View>
        <Button mode="contained" onPress={handleSave} loading={saving} style={styles.button}>Save Changes</Button>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#111', padding: 12 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  card: { backgroundColor: '#1e1e1e', padding: 16 },
  title: { color: '#ff8c00', fontSize: 20, marginBottom: 12 },
  input: { backgroundColor: '#2a2a2a', color: '#fff', marginBottom: 10, padding: 8, borderRadius: 8 },
  button: { marginTop: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { color: '#fff', marginRight: 8 },
  statusChip: { backgroundColor: '#333' },
});

export default EditBillScreen;

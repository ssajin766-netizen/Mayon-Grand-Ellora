import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { Button, Card } from 'react-native-paper';
import api from '../../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';

const CreateBillScreen = () => {
  const navigation = useNavigation<any>();
  const [period, setPeriod] = useState(''); // e.g., "Jan 2024"
  const [dueDate, setDueDate] = useState(''); // ISO string or YYYY-MM-DD
  const [amount, setAmount] = useState('');
  const [charges, setCharges] = useState(''); // JSON string of [{description, amount}]
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!period || !dueDate || !amount) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    let parsedCharges = [];
    try {
      parsedCharges = charges ? JSON.parse(charges) : [];
    } catch (e) {
      Alert.alert('Error', 'Charges must be valid JSON');
      return;
    }
    setLoading(true);
    try {
      await api.post('/admin/bills', {
        period,
        dueDate,
        amount: parseFloat(amount),
        charges: parsedCharges,
      });
      Alert.alert('Success', 'Bill created');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Create New Maintenance Bill</Text>
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
        <Button mode="contained" onPress={handleCreate} loading={loading} style={styles.button}>Create Bill</Button>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#111', padding: 12 },
  card: { backgroundColor: '#1e1e1e', padding: 16 },
  title: { color: '#ff8c00', fontSize: 20, marginBottom: 12 },
  input: { backgroundColor: '#2a2a2a', color: '#fff', marginBottom: 10, padding: 8, borderRadius: 8 },
  button: { marginTop: 10 },
});

export default CreateBillScreen;

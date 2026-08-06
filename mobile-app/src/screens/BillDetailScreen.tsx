import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Card, Button, Chip, Avatar, Divider } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ChargeItem {
  description: string;
  amount: number;
}

interface BillDetail {
  id: string;
  billNumber: string;
  invoiceNumber?: string;
  residentName: string;
  unitNumber: string;
  period: string; // e.g., "Jan 2024"
  dueDate: string; // ISO string
  societyName: string;
  societyAddress: string;
  logoUrl?: string;
  charges: ChargeItem[];
  totalAmount: number;
  status: 'Paid' | 'Unpaid' | 'Pending';
  paymentDate?: string;
  transactionId?: string;
}

const BillDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { billId } = route.params;
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchBill = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/bills/${billId}`);
      setBill(resp.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load bill details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [billId]);

  const handlePay = async () => {
    if (!bill) return;
    setPaying(true);
    try {
      const resp = await api.post(`/bills/${bill.id}/pay`);
      if (resp.data.success) {
        Alert.alert('Success', 'Payment completed');
        // Refresh bill to get updated status
        fetchBill();
      } else {
        Alert.alert('Payment Failed', resp.data.message || 'Unknown error');
      }
    } catch (e) {
      Alert.alert('Error', 'Payment request failed');
    } finally {
      setPaying(false);
    }
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const downloadRes = await FileSystem.downloadAsync(
        url,
        FileSystem.documentDirectory + filename
      );
      if (downloadRes.status === 200) {
        Alert.alert('Downloaded', `File saved to ${downloadRes.uri}`);
        // Optionally open/share
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadRes.uri);
        }
      } else {
        Alert.alert('Download failed', 'Unable to download file');
      }
    } catch (err) {
      Alert.alert('Error', 'File download error');
    }
  };

  const handleDownloadBillPdf = () => {
    if (!bill) return;
    const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/bills/${bill.id}/pdf`;
    downloadFile(url, `Bill_${bill.billNumber}.pdf`);
  };

  const handleDownloadReceipt = () => {
    if (!bill) return;
    const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/bills/${bill.id}/receipt`;
    downloadFile(url, `Receipt_${bill.billNumber}.pdf`);
  };

  if (loading || !bill) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const totalCharges = bill.charges.reduce((sum, c) => sum + c.amount, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          {bill.logoUrl ? (
            <Avatar.Image size={48} source={{ uri: bill.logoUrl }} />
          ) : (
            <Avatar.Text size={48} label={bill.societyName.charAt(0)} />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.societyName}>{bill.societyName}</Text>
            <Text style={styles.societyAddress}>{bill.societyAddress}</Text>
          </View>
        </View>
        <Divider style={{ marginVertical: 12 }} />
        <Text style={styles.sectionTitle}>Bill Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Bill #: </Text>
          <Text style={styles.value}>{bill.billNumber}</Text>
        </View>
        {bill.invoiceNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Invoice #: </Text>
            <Text style={styles.value}>{bill.invoiceNumber}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Resident: </Text>
          <Text style={styles.value}>{bill.residentName} ({bill.unitNumber})</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Period: </Text>
          <Text style={styles.value}>{bill.period}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Due Date: </Text>
          <Text style={styles.value}>{new Date(bill.dueDate).toLocaleDateString()}</Text>
        </View>
        <Divider style={{ marginVertical: 12 }} />
        <Text style={styles.sectionTitle}>Itemized Charges</Text>
        {bill.charges.map((c, idx) => (
          <View key={idx} style={styles.chargeRow}>
            <Text style={styles.chargeDesc}>{c.description}</Text>
            <Text style={styles.chargeAmt}>₹ {c.amount.toFixed(2)}</Text>
          </View>
        ))}
        <Divider style={{ marginVertical: 12 }} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmt}>₹ {totalCharges.toFixed(2)}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Status: </Text>
          <Chip style={styles.statusChip} textStyle={styles.statusChipText}>{bill.status}</Chip>
        </View>
        {bill.status === 'Paid' && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Paid On: </Text>
            <Text style={styles.value}>{new Date(bill.paymentDate!).toLocaleDateString()}</Text>
          </View>
        )}
        {bill.transactionId && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Transaction ID: </Text>
            <Text style={styles.value}>{bill.transactionId}</Text>
          </View>
        )}
        <View style={styles.actionsRow}>
          {bill.status !== 'Paid' && (
            <Button mode="contained" onPress={handlePay} loading={paying} style={styles.actionBtn}>Pay Bill</Button>
          )}
          <Button mode="outlined" onPress={handleDownloadBillPdf} style={styles.actionBtn}>Download PDF</Button>
          {bill.status === 'Paid' && (
            <Button mode="outlined" onPress={handleDownloadReceipt} style={styles.actionBtn}>Download Receipt</Button>
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 12 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  card: { backgroundColor: '#1e1e1e', padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerInfo: { marginLeft: 12 },
  societyName: { color: '#ff8c00', fontSize: 20, fontWeight: 'bold' },
  societyAddress: { color: '#fff', fontSize: 14 },
  sectionTitle: { color: '#ff8c00', fontSize: 18, marginBottom: 8 },
  infoRow: { flexDirection: 'row', marginBottom: 4 },
  label: { color: '#fff', fontWeight: '600' },
  value: { color: '#fff' },
  chargeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  chargeDesc: { color: '#fff' },
  chargeAmt: { color: '#fff' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  totalLabel: { color: '#ff8c00', fontWeight: 'bold' },
  totalAmt: { color: '#ff8c00', fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statusChip: { backgroundColor: '#333' },
  statusChipText: { color: '#fff' },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: 16 },
  actionBtn: { marginVertical: 4, width: '30%' },
});

export default BillDetailScreen;

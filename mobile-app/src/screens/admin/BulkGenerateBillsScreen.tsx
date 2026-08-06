import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, Card, Text, Divider, Modal, Portal, Provider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import api from '../../services/api';
import { AntDesign } from '@expo/vector-icons';

const BulkGenerateBillsScreen = () => {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = async () => {
    if (!month || !year) {
      Alert.alert('Error', 'Please select month and year');
      return;
    }
    setLoading(true);
    try {
      const resp = await api.post('/admin/bills/generate', {
        month,
        year,
        preview: true,
      });
      setPreviewData(resp.data); // expected: { count: number, totalAmount: number, failed: [] }
      setShowPreview(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const resp = await api.post('/admin/bills/generate', { month, year, preview: false });
      const { createdCount, totalAmount, failedRecords } = resp.data;
      Alert.alert(
        'Success',
        `Bills created: ${createdCount}\nTotal amount: ₹ ${totalAmount.toFixed(2)}\nFailed: ${failedRecords?.length ?? 0}`
      );
      // Reset UI
      setPreviewData(null);
      setShowPreview(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate bills');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Provider>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.title}>Bulk Generate Maintenance Bills</Text>
          <Picker selectedValue={month} onValueChange={setMonth} style={styles.picker} prompt="Month">
            <Picker.Item label="Select Month" value="" />
            {Array.from({ length: 12 }, (_, i) => (
              <Picker.Item key={i} label={(i + 1).toString().padStart(2, '0')} value={(i + 1).toString().padStart(2, '0')} />
            ))}
          </Picker>
          <Picker selectedValue={year} onValueChange={setYear} style={styles.picker} prompt="Year">
            <Picker.Item label="Select Year" value="" />
            {['2023', '2024', '2025', '2026'].map(y => (
              <Picker.Item key={y} label={y} value={y} />
            ))}
          </Picker>
          <Button mode="contained" onPress={handlePreview} loading={loading} style={styles.button}>
            Preview Bills
          </Button>
        </Card>
      </ScrollView>

      {/* Preview Modal */}
      <Portal>
        <Modal visible={showPreview} onDismiss={() => setShowPreview(false)} contentContainerStyle={styles.modal}> 
          <View>
            <Text style={styles.modalTitle}>Preview Bills for {month}/{year}</Text>
            {previewData ? (
              <View>
                <Text>Total Bills to be created: {previewData.count}</Text>
                <Text>Total Amount: ₹ {previewData.totalAmount?.toFixed(2) ?? '0.00'}</Text>
                {previewData.failed && previewData.failed.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ color: 'red' }}>Failed Records: {previewData.failed.length}</Text>
                  </View>
                )}
                <Divider style={{ marginVertical: 12 }} />
                <Button mode="contained" onPress={handleGenerate} loading={loading}>
                  Generate Bills
                </Button>
              </View>
            ) : (
              <Text>No data</Text>
            )}
          </View>
        </Modal>
      </Portal>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#111', padding: 12 },
  card: { backgroundColor: '#1e1e1e', padding: 16 },
  title: { color: '#ff8c00', fontSize: 20, marginBottom: 12 },
  picker: { backgroundColor: '#2a2a2a', color: '#fff', marginBottom: 8 },
  button: { marginTop: 8 },
  modal: { backgroundColor: '#1e1e1e', margin: 20, padding: 20, borderRadius: 8 },
  modalTitle: { color: '#ff8c00', fontSize: 18, marginBottom: 12 },
});

export default BulkGenerateBillsScreen;

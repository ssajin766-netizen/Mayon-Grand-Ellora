import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';

const PendingApprovalScreen = () => {
  const navigation = useNavigation<any>();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>("pending");
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const checkStatus = async () => {
    setChecking(true);
    try {
      const resp = await api.get('/auth/status');
      if (resp.data.approved) {
        setStatus('approved');
        navigation.replace('Main');
      } else if (resp.data.rejected) {
        setStatus('rejected');
        setRejectionReason(resp.data.reason || 'Your account was rejected.');
      } else {
        setStatus('pending');
        Alert.alert('Info', 'Your account is still pending approval.');
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to check status. Please try again later.');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // initial check could be automatic, but we provide a button per design
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Pending Approval</Text>
      <Text style={styles.body}>Your registration has been received and is awaiting administrator approval.</Text>
      {status === 'rejected' && <Text style={styles.rejection}>Reason: {rejectionReason}</Text>}
      {checking ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Refresh Status" onPress={checkStatus} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ff8c00', marginBottom: 12 },
  body: { color: '#fff', textAlign: 'center', marginHorizontal: 20, marginBottom: 20 },
  rejection: { color: '#ff4444', marginBottom: 20 },
});

export default PendingApprovalScreen;

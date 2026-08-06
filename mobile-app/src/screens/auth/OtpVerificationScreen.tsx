import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { useAppDispatch } from '../../store/hooks';
import { setAuthenticated, setUser } from '../../store/authSlice';

const OtpVerificationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { phone } = route.params as { phone: string };
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const resp = await api.post('/auth/verify-phone-otp', { phoneNumber: phone, otp });
      if (resp.data.success) {
        dispatch(setAuthenticated(true));
        if (resp.data.user) {
          dispatch(setUser(resp.data.user));
        }
        if (resp.data.pending) {
          navigation.replace('PendingApproval');
        } else {
          navigation.replace('Main');
        }
      } else {
        Alert.alert('Error', resp.data.message || 'OTP verification failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error while verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>Sent to {phone}</Text>
      <TextInput
        placeholder="123456"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button mode="contained" onPress={verifyOtp} style={styles.button}>Verify OTP</Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  title: { color: '#ff8c00', marginBottom: 16 },
  subtitle: { color: '#fff', marginBottom: 20 },
  input: { width: '80%', backgroundColor: '#1e1e1e', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 20 },
  button: { width: '80%' },
});

export default OtpVerificationScreen;

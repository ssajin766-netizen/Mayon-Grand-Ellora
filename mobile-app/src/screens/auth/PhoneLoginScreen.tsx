import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert } from 'react-native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';

const PhoneLoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const requestOtp = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }
    setLoading(true);
    try {
      const resp = await api.post('/auth/send-phone-otp', { phoneNumber: phone });
      if (resp.data.success) {
        navigation.navigate('PhoneOtp', { phone });
      } else {
        Alert.alert('Error', resp.data.message || 'Failed to request OTP');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Phone Login</Text>
      <TextInput
        placeholder="Enter phone number"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button mode="contained" onPress={requestOtp} style={styles.button}>Send OTP</Button>
      )}
      <Button mode="text" onPress={() => navigation.navigate('GoogleLogin')} style={styles.link}>Sign in with Google</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  title: { color: '#ff8c00', marginBottom: 20 },
  input: { width: '80%', backgroundColor: '#1e1e1e', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 20 },
  button: { width: '80%', marginBottom: 10 },
  link: { marginTop: 10 },
});

export default PhoneLoginScreen;

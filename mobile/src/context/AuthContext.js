import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if session exists on load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/auth/me');
      if (response.data && response.data.success) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 1. Send Phone OTP
  const sendPhoneOtp = async (phoneNumber) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/send-phone-otp', { phoneNumber });
      if (response.data && response.data.success) {
        return { success: true, message: response.data.message };
      }
      throw new Error(response.data?.message || 'Failed to send OTP');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'OTP sending failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // 2. Verify Phone OTP
  const verifyPhoneOtp = async (phoneNumber, otp) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/verify-phone-otp', { phoneNumber, otp });
      if (response.data && response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      throw new Error(response.data?.message || 'Invalid OTP');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'OTP Verification failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // 3. Google Login
  const loginWithGoogle = async (googleUserData) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/google', googleUserData);
      if (response.data && response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      throw new Error(response.data?.message || 'Google Login failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Google login failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // 4. Email / Password Login
  const loginWithEmail = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/login', { username: email, password });
      if (response.data && response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      throw new Error(response.data?.message || 'Login failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // 5. Logout
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.log('Logout error:', err.message);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        sendPhoneOtp,
        verifyPhoneOtp,
        loginWithGoogle,
        loginWithEmail,
        logout,
        checkSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

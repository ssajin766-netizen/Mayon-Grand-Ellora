import axios from 'axios';
import { Platform } from 'react-native';

// Default backend API URL
// Change this to your deployed backend URL (e.g., https://e-society-erp9.onrender.com)
// or local IP address for physical device / emulator testing (e.g., http://192.168.1.5:3000)
const DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://e-society-erp9.onrender.com' || DEV_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Send session cookies
});

export default api;

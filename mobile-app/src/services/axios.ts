// src/services/axios.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';
import { getAccessToken, clearAccessToken } from './authToken';

// Create a singleton Axios instance.
const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor – attach auth token if available.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers = { ...(config.headers ?? {}), Authorization: `Bearer ${token}` } as any;
    
  }
  return config;
});

// Helper to normalize error objects.
const normalizeError = (error: AxiosError) => {
  const status = error.response?.status ?? 0;
  const data = error.response?.data;
  const message =
    ((data as any)?.message || (data as any)?.error) ||
    error.message ||
    'An unexpected network error occurred';
  return { status, message, originalError: error };
};

// Response interceptor – unwrap data and handle errors.
apiClient.interceptors.response.use(
  (response) => {
    // Most of our API responses are wrapped in a `data` field; return it directly.
    return response.data;
  },
  (error: AxiosError) => {
    // If we get a 401, clear the stored token – the app can react accordingly.
    if (error.response?.status === 401) {
      clearAccessToken();
    }
    return Promise.reject(normalizeError(error));
  },
);

export default apiClient;

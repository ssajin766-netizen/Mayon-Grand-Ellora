import { BaseQueryFn } from '@reduxjs/toolkit/query';
import { AxiosError } from 'axios';
import apiClient from '../services/axios';

// Custom baseQuery using Axios. It expects an object with url, method, optional data and params.
export const axiosBaseQuery: BaseQueryFn<
  { url: string; method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; data?: any; params?: any },
  unknown,
  { status: number; data?: any; message: string }
> = async ({ url, method, data, params }) => {
  try {
    const result = await apiClient.request({ url, method, data, params });
    return { data: result };
  } catch (rawError) {
    const error = rawError as AxiosError;
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const message = error.message ?? 'Network error';
    return { error: { status, data, message } };
  }
};

import { createApi } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  tagTypes: [
    'Resident',
    'Profile',
    'Complaint',
    'Notice',
    'Visitor',
    'Bill',
    'Payment',
    'EmergencyContact',
  ],
  endpoints: () => ({}), // Feature-specific endpoints will be injected later
});

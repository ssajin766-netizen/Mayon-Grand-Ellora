import { BASE_URL } from '../config';
import api from './api';

/**
 * Checks the latest app version information from the backend.
 * Expected response format:
 * {
 *   minimumVersion: string,
 *   latestVersion: string,
 *   forceUpdate: boolean
 * }
 */
export async function checkAppVersion() {
  try {
    // Use absolute URL to avoid baseURL /api mismatch
    const response = await api.get(`${BASE_URL}/app/version`);
    return response.data;
  } catch (e:any) {
    console.warn('Failed to fetch app version info', e);
    return null;
  }
}

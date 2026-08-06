import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { resetAllState } from '../store';
import { AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { NavigationProp } from '@react-navigation/native';

/**
 * Performs full logout:
 *  - Calls backend to destroy session
 *  - Clears AsyncStorage (cached data)
 *  - Resets Redux store
 *  - Navigates back to the Auth stack (Login screen)
 */
export const performLogout = async (dispatch: AppDispatch, navigation: NavigationProp<AuthStackParamList>) => {
  try {
    await api.post('/auth/logout');
    await AsyncStorage.clear();
    dispatch(resetAllState());
    // Update Redux auth state to unauthenticated
    dispatch(logout());
  } catch (e) {
    console.error('Logout failed', e);
  }
};

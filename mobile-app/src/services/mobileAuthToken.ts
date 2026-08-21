import * as SecureStore from 'expo-secure-store';

const MOBILE_AUTH_TOKEN_KEY =
  'mayon_mobile_auth_token';


// ==================================================
// SAVE
// ==================================================

export const saveMobileAuthToken =
  async (
    token: string
  ): Promise<void> => {

    if (!token) {
      return;
    }

    try {

      await SecureStore.setItemAsync(
        MOBILE_AUTH_TOKEN_KEY,
        token
      );

      console.log(
        'MOBILE AUTH TOKEN SAVED'
      );

    } catch (error) {

      console.error(
        'MOBILE AUTH TOKEN SAVE FAILED:',
        error
      );

      throw error;
    }
  };


// ==================================================
// GET
// ==================================================

export const getMobileAuthToken =
  async (): Promise<string | null> => {

    try {

      return await SecureStore.getItemAsync(
        MOBILE_AUTH_TOKEN_KEY
      );

    } catch (error) {

      console.error(
        'MOBILE AUTH TOKEN READ FAILED:',
        error
      );

      return null;
    }
  };


// ==================================================
// CLEAR
// ==================================================

export const clearMobileAuthToken =
  async (): Promise<void> => {

    try {

      await SecureStore.deleteItemAsync(
        MOBILE_AUTH_TOKEN_KEY
      );

      console.log(
        'MOBILE AUTH TOKEN CLEARED'
      );

    } catch (error) {

      console.error(
        'MOBILE AUTH TOKEN CLEAR FAILED:',
        error
      );
    }
  };
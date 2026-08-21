import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STATE_KEY = '@mayon/authenticated';
const AUTH_USER_KEY = '@mayon/auth_user';

export interface PersistedAuth {
  authenticated: boolean;
  user: any | null;
}

/**
 * Save a valid logged-in user.
 *
 * IMPORTANT:
 * Never persist `null` as authenticated.
 */
export const saveAuthState = async (
  user: any
): Promise<void> => {

  try {

    // -----------------------------------------------
    // Do not allow null/undefined to create a login
    // -----------------------------------------------

    if (!user) {

      console.log(
        'SAVE AUTH STATE: NO USER - CLEARING AUTH'
      );

      await clearAuthState();

      return;
    }

    await AsyncStorage.multiSet([

      [
        AUTH_STATE_KEY,
        'true',
      ],

      [
        AUTH_USER_KEY,
        JSON.stringify(user),
      ],

    ]);

    console.log(
      'AUTH STATE PERSISTED'
    );

  } catch (error) {

    console.error(
      'AUTH STATE SAVE FAILED:',
      error
    );

  }
};


/**
 * Restore persisted login.
 */
export const getPersistedAuth =
  async (): Promise<PersistedAuth> => {

    try {

      const values =
        await AsyncStorage.multiGet([
          AUTH_STATE_KEY,
          AUTH_USER_KEY,
        ]);

      const storedAuthenticated =
        values[0]?.[1] === 'true';

      let user: any | null = null;

      // -----------------------------------------------
      // Restore user
      // -----------------------------------------------

      const storedUser =
        values[1]?.[1];

      if (storedUser) {

        try {

          user =
            JSON.parse(storedUser);

        } catch (error) {

          console.error(
            'FAILED TO PARSE STORED USER:',
            error
          );

          user = null;

        }

      }

      // -----------------------------------------------
      // Authentication is valid ONLY if:
      //
      // authenticated === true
      // AND
      // user exists
      // -----------------------------------------------

      const authenticated =
        storedAuthenticated &&
        !!user;

      console.log(
        'PERSISTED AUTH CHECK:',
        {
          storedAuthenticated,
          hasUser: !!user,
          authenticated,
        }
      );

      // -----------------------------------------------
      // Repair corrupted state
      // -----------------------------------------------

      if (
        storedAuthenticated &&
        !user
      ) {

        console.log(
          'INVALID PERSISTED AUTH STATE - CLEARING'
        );

        await clearAuthState();

      }

      return {
        authenticated,
        user,
      };

    } catch (error) {

      console.error(
        'AUTH STATE RESTORE FAILED:',
        error
      );

      return {
        authenticated: false,
        user: null,
      };

    }

  };


/**
 * Clear persisted login.
 *
 * Call this ONLY during logout.
 */
export const clearAuthState =
  async (): Promise<void> => {

    try {

      await AsyncStorage.multiRemove([

        AUTH_STATE_KEY,

        AUTH_USER_KEY,

      ]);

      console.log(
        'PERSISTED AUTH STATE CLEARED'
      );

    } catch (error) {

      console.error(
        'AUTH STATE CLEAR FAILED:',
        error
      );

    }

  };


// Optional backward-compatible alias
export const clearPersistedAuth =
  clearAuthState;
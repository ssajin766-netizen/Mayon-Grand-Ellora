// src/services/authToken.ts
let accessToken: string | null = null;

/**
 * Retrieve the current access token.
 * Returns an empty string if no token is set, which makes the caller's
 * Authorization header omission straightforward.
 */
export const getAccessToken = (): string => {
  return accessToken ?? '';
};

/** Set a new access token – typically after a successful login or token refresh. */
export const setAccessToken = (token: string): void => {
  accessToken = token;
};

/** Clear the stored token – used on logout or when a 401 response is received. */
export const clearAccessToken = (): void => {
  accessToken = null;
};

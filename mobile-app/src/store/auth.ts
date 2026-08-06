// src/store/auth.ts
import { useAppSelector } from './hooks';
import type { RootState } from './index';

/** Hook to retrieve the current user's role from Redux store. */
export const useAuthRole = (): RootState['auth'] => {
  return useAppSelector((state: RootState) => state.auth);
};

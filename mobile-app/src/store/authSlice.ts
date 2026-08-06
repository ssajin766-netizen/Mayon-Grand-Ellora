// src/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Role = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  // add other fields as needed
}

interface AuthState {
  role: Role;
  isAuthenticated: boolean;
  user: User | null;
}

const initialState: AuthState = {
  role: 'user',
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { setAuthenticated, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

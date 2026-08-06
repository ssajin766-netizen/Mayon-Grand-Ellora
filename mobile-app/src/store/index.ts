import { configureStore, combineReducers } from '@reduxjs/toolkit';
import profileReducer from './profileSlice';
import { baseApi } from './api';

import emergencyReducer from './emergencyContactsSlice';
import authReducer from './authSlice';

// Combine reducers (profile, emergency, auth, RTK Query baseApi)
const rootReducer = combineReducers({
  profile: profileReducer,
  emergency: emergencyReducer,
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
  // Add other reducers here in the future
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(baseApi.middleware),
});

export const resetAllState = () => ({ type: 'RESET_ALL' } as const);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

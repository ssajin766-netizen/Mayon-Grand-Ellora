// src/store/emergencyContactsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';
import api, { fetchEmergencyCategories } from '../services/api';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  category: string;
  enabled: boolean;
  // Preserve any additional fields returned by the backend
  [key: string]: any;
}

export interface EmergencyState {
  contacts: Contact[];
  loading: boolean;
  error?: string;
  categories: string[]; // from backend or defaults
}

const initialState: EmergencyState = {
  contacts: [],
  loading: false,
  error: undefined,
  categories: [],
};

// Async thunks
export const fetchEmergencyContacts = createAsyncThunk(
  'emergency/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/emergency-contacts');
      return response.data as Contact[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch categories thunk with fallback handling
export const fetchEmergencyCategoriesThunk = createAsyncThunk(
  'emergency/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchEmergencyCategories();
      return data as string[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);



export const addEmergencyContact = createAsyncThunk(
  'emergency/addContact',
  async (contact: Omit<Contact, "id">, { rejectWithValue }) => {
    try {
      const response = await api.post('/emergency-contacts', contact);
      return response.data as Contact;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateEmergencyContact = createAsyncThunk(
  'emergency/updateContact',
  async (contact: Contact, { rejectWithValue }) => {
    try {
      const response = await api.put(`/emergency-contacts/${contact.id}`, contact);
      return response.data as Contact;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteEmergencyContact = createAsyncThunk(
  'emergency/deleteContact',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/emergency-contacts/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const toggleContactEnabled = createAsyncThunk(
  'emergency/toggleEnabled',
  async ({ id, enabled }: { id: string; enabled: boolean }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/emergency-contacts/${id}`, { enabled });
      return response.data as Contact;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice definition
const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<string[]>) {
      state.categories = action.payload;
    },
    clearEmergencyState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchEmergencyContacts.pending, state => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(addEmergencyContact.pending, (state, action) => {
        state.loading = true;
        state.error = undefined;
        const tempContact = { ...action.meta.arg, id: `temp-${Date.now()}` } as any;
        state.contacts.unshift(tempContact);
      })
      .addCase(updateEmergencyContact.pending, (state, action) => {
        state.loading = true;
        state.error = undefined;
        const idx = state.contacts.findIndex(c => c.id === action.meta.arg.id);
        if (idx !== -1) {
          state.contacts[idx] = { ...state.contacts[idx], ...action.meta.arg } as any;
        }
      })
      .addCase(deleteEmergencyContact.pending, (state, action) => {
        state.loading = true;
        state.error = undefined;
        state.contacts = state.contacts.filter(c => c.id !== action.meta.arg);
      })
      .addCase(toggleContactEnabled.pending, (state, action) => {
        // Optimistic update: toggle enabled flag immediately
        const idx = state.contacts.findIndex(c => c.id === action.meta.arg.id);
        if (idx !== -1) {
          state.contacts[idx].enabled = !state.contacts[idx].enabled;
        }
      })
      .addCase(fetchEmergencyContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload;
      })
      .addCase(fetchEmergencyContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEmergencyCategoriesThunk.pending, state => { state.loading = true; })
      .addCase(fetchEmergencyCategoriesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchEmergencyCategoriesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addEmergencyContact.fulfilled, (state, action) => {
        // Replace temporary contact with server response if present
        const tempIdx = state.contacts.findIndex(c => typeof c.id === 'string' && c.id.startsWith('temp-'));
        if (tempIdx !== -1) {
          state.contacts[tempIdx] = action.payload;
        } else {
          state.contacts.unshift(action.payload);
        }
      })
      .addCase(updateEmergencyContact.fulfilled, (state, action) => {
        const idx = state.contacts.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.contacts[idx] = action.payload;
      })
      .addCase(deleteEmergencyContact.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter(c => c.id !== action.payload);
      })
      .addCase(toggleContactEnabled.fulfilled, (state, action) => {
        const idx = state.contacts.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.contacts[idx] = action.payload;
      })
      .addCase(addEmergencyContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Remove temporary contact if present
        state.contacts = state.contacts.filter(c => !(typeof c.id === 'string' && c.id.startsWith('temp-')));
      })
      .addCase(updateEmergencyContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Optionally could refetch contacts to sync state
      })
      .addCase(deleteEmergencyContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Optionally could refetch contacts to sync state
      })
      .addCase(toggleContactEnabled.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Revert toggle by refetching or flipping back; simple approach refetch later
      });
  },
});

export const { setCategories, clearEmergencyState } = emergencySlice.actions;
export default emergencySlice.reducer;

// Selector helpers
export const selectAllContacts = (state: RootState) => state.emergency.contacts;
export const selectContactById = (state: RootState, id: string) =>
  state.emergency.contacts.find((c) => c.id === id);
export const selectEmergencyCategories = (state: RootState) => state.emergency.categories;
export const selectEmergencyLoading = (state: RootState) => state.emergency.loading;
export const selectEmergencyError = (state: RootState) => state.emergency.error;


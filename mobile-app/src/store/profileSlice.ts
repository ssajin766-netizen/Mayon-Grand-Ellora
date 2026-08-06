import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getProfile, updateProfile, uploadProfilePhoto } from '../services/api';

export interface ProfileState {
  data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    societyName: string;
    block: string;
    flat: string;
    residentId?: string;
    role: 'Admin' | 'Resident';
    accountStatus: 'Approved' | 'Pending';
    memberSince: string; // ISO string
    avatarUrl?: string;
    otpMethod: 'phone' | 'email';
    twoFAEnabled: boolean;
  } | null;
  loading: boolean;
  error?: string;
  uploadProgress?: number;
  avatarError?: string;
  // New top‑level fields expected by tests
  twoFAEnabled?: boolean;
  otpMethod?: 'phone' | 'email';
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: undefined,
  uploadProgress: 0,
  avatarError: undefined,
  // New default values expected by tests
  twoFAEnabled: false,
  otpMethod: 'phone',
};

// Thunks
export const saveProfile = createAsyncThunk('profile/saveProfile', async (profileData: any, { rejectWithValue }) => {
  try {
    const response = await updateProfile(profileData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});
export const fetchProfile = createAsyncThunk('profile/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await getProfile();
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});
export const refreshProfile = createAsyncThunk('profile/refreshProfile', async (_, { dispatch }) => {
  await dispatch(fetchProfile());
});

export const uploadAvatar = createAsyncThunk('profile/uploadAvatar', async (formData: FormData, { dispatch, rejectWithValue }) => {
  try {
    const response = await uploadProfilePhoto(formData, (progressEvent) => {
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      dispatch(setUploadProgress(progress));
    });
    // Reset progress after success
    dispatch(setUploadProgress(100));
    return response.data; // assume { avatarUrl: string }
  } catch (err: any) {
    dispatch(setUploadProgress(0));
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const removeAvatar = createAsyncThunk('profile/removeAvatar', async (_, { rejectWithValue }) => {
  try {
    const emptyForm = new FormData();
    const response = await uploadProfilePhoto(emptyForm);
    return response.data; // backend should return default avatar URL or null
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    resetProfileState: () => initialState,
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    clearAvatarError: (state) => {
      state.avatarError = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveProfile.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(saveProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (state.data) {
          state.data = { ...state.data, ...action.payload };
        } else {
          state.data = action.payload;
        }
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(uploadAvatar.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (state.data) {
          state.data.avatarUrl = action.payload.avatarUrl;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeAvatar.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(removeAvatar.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (state.data) {
          state.data.avatarUrl = undefined;
        }
      })
      .addCase(removeAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetProfileState, setUploadProgress, clearAvatarError } = profileSlice.actions;
export default profileSlice.reducer;

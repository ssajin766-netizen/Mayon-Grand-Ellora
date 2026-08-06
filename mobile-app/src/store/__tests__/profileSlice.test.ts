import profileReducer, { fetchProfile, saveProfile, uploadAvatar, removeAvatar } from '../../store/profileSlice';
import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

describe('profileSlice reducer', () => {
  const initialState = {
    data: null,
    loading: false,
    error: null,
    uploadProgress: 0,
    avatarError: null,
    twoFAEnabled: false,
    otpMethod: 'phone',
  };

  it('should handle initial state', () => {
    expect(profileReducer(undefined, { type: 'unknown' })).toMatchObject(initialState);
  });
});

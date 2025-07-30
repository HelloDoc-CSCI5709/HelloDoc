import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, UserProfile, UserState, VerificationResponse } from '../types/userTypes';
import { checkVerificationStatus, verifyEmail } from '../actions/userActions';

const initialState: UserState = {
  userId: undefined,
  currentUser: null,
  loading: false,
  error: null,
  verificationStatus: null,
  role: undefined,
  profile: undefined,
  doctorsError: false,
  selectedDoctor: false,
  doctorsLoading: false,
  doctors: []
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
      state.userId = action.payload.id;
      state.role = action.payload.role;
      state.verificationStatus = action.payload.isVerified ? 'verified' : 'unverified';
      state.error = null;
    },
    clearUser(state) {
      state.currentUser = null;
      state.userId = undefined;
      state.role = undefined;
      state.verificationStatus = null;
      state.profile = undefined;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
      state.userId = action.payload.id;
      state.role = action.payload.role;
      state.verificationStatus = action.payload.isVerified ? 'verified' : 'unverified';
      state.error = null;
    },
    registerSuccess(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
      state.userId = action.payload.id;
      state.role = action.payload.role;
      state.verificationStatus = 'unverified';
      state.error = null;
    },
    clearUserError(state) {
      state.error = null;
    },
    updateUserProfile(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.currentUser) {
        state.currentUser.profile = {
          ...state.currentUser.profile,
          ...action.payload,
          fullName: action.payload.fullName ?? state.currentUser.profile?.fullName ?? '',
          email: action.payload.email ?? state.currentUser.profile?.email ?? ''
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkVerificationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkVerificationStatus.fulfilled, (
        state, 
        action: PayloadAction<VerificationResponse>
      ) => {
        state.loading = false;
        state.verificationStatus = action.payload.isVerified ? 'verified' : 'unverified';
        
        if (action.payload.user) {
          state.currentUser = action.payload.user;
          state.userId = action.payload.user.id;
          state.role = action.payload.user.role;
        } else if (state.currentUser) {
          state.currentUser.isVerified = action.payload.isVerified;
        }
      })
      .addCase(checkVerificationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.verificationStatus = null;
      })
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        state.verificationStatus = 'verified';
        if (state.currentUser) {
          state.currentUser.isVerified = true;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  setUser,
  clearUser,
  loginSuccess, 
  registerSuccess, 
  clearUserError,
  updateUserProfile 
} = userSlice.actions;

export default userSlice.reducer;
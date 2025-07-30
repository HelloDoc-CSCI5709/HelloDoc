import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loginUser, registerUser, refreshTokens } from '../actions/authActions';
import type { AuthState, AuthTokens, ForgotPasswordState } from '../types/authTypes';

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthTokens>) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(refreshTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshTokens.fulfilled, (state, action: PayloadAction<AuthTokens>) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  }
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

export const forgotPasswordInitialState: ForgotPasswordState = {
  loading: false,
  error: null,
  message: null,
  otpVerified: false
};

export const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState: forgotPasswordInitialState,
  reducers: {
    resetForgotPasswordState(state) {
      state.loading = false;
      state.error = null;
      state.message = null;
      state.otpVerified = false;
    }
  },
});

export const { resetForgotPasswordState } = forgotPasswordSlice.actions;
export const forgotPasswordReducer = forgotPasswordSlice.reducer;
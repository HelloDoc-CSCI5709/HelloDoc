// src/redux/selectors/authSelectors.ts
import type { RootAuthState } from '../types/authTypes';

// Core Auth Selectors
export const selectAccessToken = (state: RootAuthState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootAuthState) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: RootAuthState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootAuthState) => state.auth.loading;
export const selectAuthError = (state: RootAuthState) => state.auth.error;
export const selectAuthState = (state: RootAuthState) => state.auth;

// Forgot Password Selectors
export const selectForgotPasswordLoading = (state: RootAuthState) => state.forgotPassword.loading;
export const selectForgotPasswordError = (state: RootAuthState) => state.forgotPassword.error;
export const selectForgotPasswordMessage = (state: RootAuthState) => state.forgotPassword.message;
export const selectOtpVerified = (state: RootAuthState) => state.forgotPassword.otpVerified;
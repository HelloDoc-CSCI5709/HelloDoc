// src/redux/types/authTypes.ts

// ==================== CORE AUTH TYPES ====================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: 'patient' | 'doctor' | 'admin';
  securityQuestion: string;
  securityAnswer: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// ==================== FORGOT PASSWORD TYPES ====================
export interface ForgotPasswordState {
  loading: boolean;
  error: string | null;
  message: string | null;
  otpVerified: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

// ==================== ROOT STATE ====================
export interface RootAuthState {
  auth: AuthState;
  forgotPassword: ForgotPasswordState;
}
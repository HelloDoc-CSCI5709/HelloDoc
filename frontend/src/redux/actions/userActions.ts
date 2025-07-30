import { createAsyncThunk } from '@reduxjs/toolkit';
import { type VerificationResponse } from '../types/userTypes';

export const checkVerificationStatus = createAsyncThunk(
  'user/checkVerificationStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/verify-status', {
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
        throw new Error('Failed to check verification status');
      }
      
      const data = await response.json();
      return {
        isVerified: data.isVerified,
        user: data.user 
      } as VerificationResponse;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'user/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      if (!response.ok) {
        throw new Error('Email verification failed');
      }
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);
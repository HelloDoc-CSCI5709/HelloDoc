import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  PatientProfile,
  PatientDocument
} from '../types/patientTypes';
import { BASE_URL } from '../../constant_url';

type RequestInit = globalThis.RequestInit;
type HeadersInit = globalThis.HeadersInit;

interface UserData {
  fullName: string;
  email: string;
}

interface ProfileResponse {
  user: UserData;
  profile: PatientProfile;
}

interface ErrorResponse {
  message: string;
  [key: string]: unknown;
}

const fetchWithAuth = async <T>(url: string, options: RequestInit = {}, isJson: boolean = true): Promise<{ body: T }> => {
  const token = localStorage.getItem('accessToken');
  
  const headers: HeadersInit = {
    ...(isJson && { 'Content-Type': 'application/json' }),
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

export const fetchPatientProfile = createAsyncThunk(
  'patient/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<ProfileResponse>('/patient/profile');
      return response.body.profile;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const updatePatientProfile = createAsyncThunk(
  'patient/updateProfile',
  async (profileData: Partial<PatientProfile>, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<PatientProfile>('/patient/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      return response.body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const uploadPatientDocument = createAsyncThunk(
  'patient/uploadDocument',
  async ({ docType, file }: { docType: string, file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      let endpoint = '';
      switch (docType) {
        case 'healthcard-front':
          endpoint = '/patient/upload/healthcard/front';
          break;
        case 'healthcard-back':
          endpoint = '/patient/upload/healthcard/back';
          break;
        case 'insurance':
          endpoint = '/patient/upload/insurance';
          break;
        case 'allergy':
          endpoint = '/patient/upload/allergy';
          break;
        case 'history':
          endpoint = '/patient/upload/medical-history';
          break;
        default:
          throw new Error('Invalid document type');
      }

      const response = await fetchWithAuth<PatientDocument>(endpoint, {
        method: 'POST',
        body: formData,
      }, false);

      return response.body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const fetchPatientDocuments = createAsyncThunk(
  'patient/fetchDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<PatientDocument[]>('/patient/documents');
      return response.body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);
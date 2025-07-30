import axios, { type AxiosResponse } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  Doctor,
  DoctorAvailability,
} from '../types/doctorTypes';
import { BASE_URL } from '../../constant_url';

// Define API response structure
interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  body: T;
}

// For file upload responses
interface DirectApiResponse {
  status: number;
  message: string;
  body: unknown;
}

// Error response also follows ApiResponse structure
interface ApiError {
  response?: {
    data?: ApiResponse<null>;
  };
  message: string;
}

// Generic API call helper
const apiRequest = async <T = unknown>(
  url: string,
  method: string = 'GET',
  data?: unknown,
  headers: Record<string, string> = {}
): Promise<AxiosResponse<ApiResponse<T>>> => {
  const token = localStorage.getItem('accessToken');
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    data,
  };
  return axios(config);
};

// Fetch doctors (for filters/search)
export const fetchDoctors = createAsyncThunk(
  'doctor/fetchDoctors',
  async (params: {
    specialization?: string;
    location?: string;
    availability?: string;
    rating?: number;
    experience?: number;
    consultationFee?: { min?: number; max?: number };
    lng?: number;
    lat?: number;
    radius?: number;
    page?: number;
    limit?: number;
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'consultationFee' && typeof value === 'object') {
            if (value.min !== undefined) queryParams.append('minFee', String(value.min));
            if (value.max !== undefined) queryParams.append('maxFee', String(value.max));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });

      const queryString = queryParams.toString();
      const url = queryString ? `/api/doctors/list/all?${queryString}` : '/api/doctors/list/all';
      const response = await apiRequest<Doctor[]>(url);
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

// Profile Actions
export const getDoctorProfile = createAsyncThunk(
  'doctor/getDoctorProfile',
  async (doctorId: string | null, { rejectWithValue }) => {
    try {
      const url = doctorId ? `/api/doctors/profile?doctorId=${doctorId}` : '/api/doctors/profile';
      const response = await apiRequest<Doctor>(url);
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

export const updateBasicDoctorProfile = createAsyncThunk(
  'doctor/updateBasicDoctorProfile',
  async (profileData: Partial<Doctor>, { rejectWithValue }) => {
    try {
      const response = await apiRequest<Doctor>('/api/doctors/profile/basic', 'PUT', profileData);
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

export const updateDoctorAddress = createAsyncThunk(
  'doctor/updateDoctorAddress',
  async (addressData: { address: string; coordinates: [number, number] }, { rejectWithValue }) => {
    try {
      const response = await apiRequest('/api/doctors/profile/address', 'PUT', addressData);
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  'doctor/uploadProfilePicture',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('accessToken');
      const response = await axios.post<DirectApiResponse>(`${BASE_URL}/api/doctors/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

// Availability
export const updateAvailability = createAsyncThunk(
  'doctor/updateAvailability',
  async (slots: DoctorAvailability[], { rejectWithValue }) => {
    try {
      const response = await apiRequest('/api/doctors/profile/availability', 'PUT', { slots });
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

export const getAvailability = createAsyncThunk(
  'doctor/getAvailability',
  async ({ doctorId }: { doctorId?: string } = {}, { rejectWithValue }) => {
    try {
      const url = doctorId ? `/api/doctors/availability?doctorId=${doctorId}` : `/api/doctors/availability`;
      const response = await apiRequest(url);
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

// Credentials
export const submitDoctorCredential = createAsyncThunk(
  'doctor/submitDoctorCredential',
  async ({ doctorId, file }: { doctorId: string; file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('accessToken');
      const response = await axios.post<DirectApiResponse>(
        `${BASE_URL}/api/doctors/${doctorId}/credentials`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

export const getDoctorCredentials = createAsyncThunk(
  'doctor/getDoctorCredentials',
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/api/doctors/${doctorId}/credentials`);
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

export const getDoctorCredentialById = createAsyncThunk(
  'doctor/getDoctorCredentialById',
  async ({ doctorId, credentialId }: { doctorId: string; credentialId: string }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/api/doctors/${doctorId}/credentials/${credentialId}`);
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

export const approveDoctorCredential = createAsyncThunk(
  'doctor/approveDoctorCredential',
  async ({ doctorId, credentialId, adminId }: { doctorId: string; credentialId: string; adminId: string }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/api/doctors/${doctorId}/credentials/${credentialId}/approve`, 'PUT', { adminId });
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

export const rejectDoctorCredential = createAsyncThunk(
  'doctor/rejectDoctorCredential',
  async ({ doctorId, credentialId, adminId, reason }: { doctorId: string; credentialId: string; adminId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/api/doctors/${doctorId}/credentials/${credentialId}/reject`, 'PUT', { adminId, reason });
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

// Public-facing endpoints
export const getPublicDoctorProfile = createAsyncThunk(
  'doctor/getPublicDoctorProfile',
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/api/doctors/public/${doctorId}`);
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

export const listDoctors = createAsyncThunk(
  'doctor/listDoctors',
  async (params: {
    specialization?: string;
    lng?: number;
    lat?: number;
    radius?: number;
    page?: number;
    limit?: number;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const url = queryParams.toString() ? `/api/doctors/list/all?${queryParams}` : '/api/doctors/list/all';
      const response = await apiRequest(url);
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

export const getDoctorById = createAsyncThunk(
  'doctor/getDoctorById',
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/api/doctors/${doctorId}`);
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

export const getDoctorAvailabilityByDate = createAsyncThunk(
  'doctor/getDoctorAvailabilityByDate',
  async ({ doctorId, date }: { doctorId: string; date: string }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/api/doctors/${doctorId}/availability?date=${date}`);
      return response.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

// Utility actions
export const resetDoctorState = createAsyncThunk(
  'doctor/resetDoctorState',
  async () => null
);

export const clearDoctorError = createAsyncThunk(
  'doctor/clearDoctorError',
  async () => null
);

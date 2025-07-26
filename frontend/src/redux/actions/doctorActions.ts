import axios, { type AxiosResponse } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
    Doctor,
    DoctorAvailability,
} from '../types/doctorTypes';
import { BASE_URL } from '../../constant_url';

// Define API response structure
interface ApiResponse<T = unknown> {
  data: {
    body: T;
  };
}

// Define direct response structure for axios calls
interface DirectApiResponse {
  data: {
    body: unknown;
  };
}

// Define error structure
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

// Helper function for API calls
const apiRequest = async (
  url: string,
  method: string = 'GET',
  data?: unknown,
  headers: Record<string, string> = {}
): Promise<AxiosResponse<ApiResponse>> => {
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

// Fetch Doctors Action - Added for AppointmentBooking
export const fetchDoctors = createAsyncThunk(
  'doctor/fetchDoctors',
  async (params: { 
    specialization?: string; 
    location?: string;
    availability?: string;
    rating?: number;
    experience?: number;
    consultationFee?: {
      min?: number;
      max?: number;
    };
    lng?: number; 
    lat?: number; 
    radius?: number; 
    page?: number; 
    limit?: number;
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Handle nested consultationFee object
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'consultationFee' && typeof value === 'object') {
            const feeObj = value as { min?: number; max?: number };
            if (feeObj.min !== undefined) queryParams.append('minFee', String(feeObj.min));
            if (feeObj.max !== undefined) queryParams.append('maxFee', String(feeObj.max));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
      
      const queryString = queryParams.toString();
      const url = queryString ? `/doctors/list/all?${queryString}` : '/doctors/list/all';
      const response = await apiRequest(url);
      return response.data.data.body;
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
      const url = doctorId ? `/doctors/profile?doctorId=${doctorId}` : '/doctors/profile';
      const response = await apiRequest(url);
      return response.data.data.body;
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
      const response = await apiRequest('/doctors/profile/basic', 'PUT', profileData);
      return response.data.data.body;
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
      const response = await apiRequest('/doctors/profile/address', 'PUT', addressData);
      return response.data.data.body;
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
      const response = await axios.post<DirectApiResponse>(`${BASE_URL}/doctors/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

// Availability Actions
export const updateAvailability = createAsyncThunk(
  'doctor/updateAvailability',
  async (slots: DoctorAvailability[], { rejectWithValue }) => {
    try {
      const response = await apiRequest('/doctors/profile/availability', 'PUT', { slots });
      return response.data.data.body;
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
      const url = doctorId ? `/doctors/availability?doctorId=${doctorId}` : '/doctors/availability';
      const response = await apiRequest(url);
      return response.data.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

// Credentials Actions
export const submitDoctorCredential = createAsyncThunk(
  'doctor/submitDoctorCredential',
  async ({ doctorId, file }: { doctorId: string; file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('accessToken');
      const response = await axios.post<DirectApiResponse>(`${BASE_URL}/doctors/${doctorId}/credentials`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data.body;
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
      const response = await apiRequest(`/doctors/${doctorId}/credentials`);
      return response.data.data.body;
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
      const response = await apiRequest(`/doctors/${doctorId}/credentials/${credentialId}`);
      return response.data.data.body;
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
      const response = await apiRequest(
        `/doctors/${doctorId}/credentials/${credentialId}/approve`,
        'PUT',
        { adminId }
      );
      return response.data.data.body;
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
      const response = await apiRequest(
        `/doctors/${doctorId}/credentials/${credentialId}/reject`,
        'PUT',
        { adminId, reason }
      );
      return response.data.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

// Public Actions
export const getPublicDoctorProfile = createAsyncThunk(
  'doctor/getPublicDoctorProfile',
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/doctors/public/${doctorId}`);
      return response.data.data.body;
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
    limit?: number 
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      const url = queryString ? `/doctors/list/all?${queryString}` : '/doctors/list/all';
      const response = await apiRequest(url);
      return response.data.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

// Get Doctor by ID - Useful for appointment booking
export const getDoctorById = createAsyncThunk(
  'doctor/getDoctorById',
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/doctors/${doctorId}`);
      return response.data.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

// Get Doctor Availability by Date - For appointment booking
export const getDoctorAvailabilityByDate = createAsyncThunk(
  'doctor/getDoctorAvailabilityByDate',
  async ({ doctorId, date }: { doctorId: string; date: string }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/doctors/${doctorId}/availability?date=${date}`);
      return response.data.data.body;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || apiError.message);
    }
  }
);

// Reset action
export const resetDoctorState = createAsyncThunk(
  'doctor/resetDoctorState',
  async () => {
    return null;
  }
);

// Clear error action
export const clearDoctorError = createAsyncThunk(
  'doctor/clearDoctorError',
  async () => {
    return null;
  }
);
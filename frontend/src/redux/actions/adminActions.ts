import axios from "axios";
import type { ThunkAction } from "redux-thunk";
import type { AnyAction } from "redux";
import type { RootState } from "../store";
import {
  ADMIN_FETCH_USERS_REQUEST,
  ADMIN_FETCH_USERS_SUCCESS,
  ADMIN_FETCH_USERS_FAILURE,
  ADMIN_FETCH_APPOINTMENTS_REQUEST,
  ADMIN_FETCH_APPOINTMENTS_SUCCESS,
  ADMIN_FETCH_APPOINTMENTS_FAILURE,
  ADMIN_DELETE_APPOINTMENT_REQUEST,
  ADMIN_DELETE_APPOINTMENT_SUCCESS,
  ADMIN_DELETE_APPOINTMENT_FAILURE,
  ADMIN_APPROVE_DOCTOR_REQUEST,
  ADMIN_APPROVE_DOCTOR_SUCCESS,
  ADMIN_APPROVE_DOCTOR_FAILURE,
  ADMIN_REJECT_DOCTOR_REQUEST,
  ADMIN_REJECT_DOCTOR_SUCCESS,
  ADMIN_REJECT_DOCTOR_FAILURE,
  ADMIN_FETCH_CREDENTIALS_REQUEST,
  ADMIN_FETCH_CREDENTIALS_SUCCESS,
  ADMIN_FETCH_CREDENTIALS_FAILURE,
  ADMIN_FETCH_VIDEO_LOGS_REQUEST,
  ADMIN_FETCH_VIDEO_LOGS_SUCCESS,
  ADMIN_FETCH_VIDEO_LOGS_FAILURE,
} from "../types/adminTypes";
import { BASE_URL } from "../../constant_url";

interface ApiResponse<T> {
  status: number;
  message: string;
  body: T;
}

export interface AddressComponents {
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  streetNumber?: string;
  streetName?: string;
}

export interface Location {
  type: string;
  coordinates: [number, number];
}

export interface ProfilePicture {
  filename: string;
  path: string;
}

export interface PracticeDetails {
  practiceName?: string;
  practiceType?: 'clinic' | 'hospital' | 'private_practice' | 'telehealth' | 'home_visits';
  acceptsInsurance?: boolean;
  languages?: string[];
  consultationFee?: number;
}

export interface DoctorProfile {
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  addressComponents?: AddressComponents;
  location?: Location;
  education?: string;
  specialization?: string[];
  bio?: string;
  profilePicture?: ProfilePicture;
  isApproved?: boolean;
  practiceDetails?: PracticeDetails;
}

export interface PatientProfile {
  mobile: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  emergencyContact?: string;
}

export interface User {
  _id: string;
  sub?: string; // Added to store JWT 'sub' field for adminId
  fullName: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  emailVerified?: boolean;
  createdAt?: string;
  profile?: DoctorProfile | PatientProfile | null;
  credentialStatus?: Credential | null;
}

export interface Credential {
  _id: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Not Submitted';
  doctorId: string;
  doctorName?: string;
  fileName?: string;
  filePath?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reason?: string;
  adminId?: string;
}

export interface Appointment {
  _id: string;
  patientId: { _id: string; fullName: string; email: string };
  doctorId: { _id: string; fullName: string; email: string };
  scheduledFor: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoLog {
  _id: string;
  appointmentId: string;
  roomId: string;
  userId: string;
  role: string;
  joinedAt: string;
  leftAt?: string;
  durationInMin?: number;
}

type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

const axiosWithAuth = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("No access token found");
  }
  
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });
};

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || defaultMessage;
  }
  return defaultMessage;
};

export const fetchUsers = (): AppThunk => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_FETCH_USERS_REQUEST });
    const api = axiosWithAuth();

    const [doctorsResponse, patientsResponse] = await Promise.all([
      api.get<{ body: { doctors: User[]; pagination: { page: number; limit: number; total: number; pages: number } } }>('/api/doctors/all'),
      api.get<{ body: User[] }>('/api/patient/all'),
    ]);

    const doctors = doctorsResponse.data.body.doctors.map(user => ({
      ...user,
      role: 'doctor' as const
    }));
    const patients = patientsResponse.data.body.map(user => ({
      ...user,
      role: 'patient' as const
    }));

    dispatch({
      type: ADMIN_FETCH_USERS_SUCCESS,
      payload: {
        doctors,
        patients
      },
    });
  } catch (error) {
    const errorMessage = handleApiError(error, 'Failed to fetch users');
    dispatch({ type: ADMIN_FETCH_USERS_FAILURE, payload: errorMessage });
  }
};

export const fetchAppointments = (): AppThunk => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_FETCH_APPOINTMENTS_REQUEST });
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }
    const decoded = decodeJwt(token);
    const role = decoded?.role || 'patient';
    const endpoint = role === 'admin' ? '/api/appointments/all' : '/api/appointments';
    const api = axiosWithAuth();

    const response = await api.get<{ body: Appointment[] }>(endpoint);
    dispatch({
      type: ADMIN_FETCH_APPOINTMENTS_SUCCESS,
      payload: response.data.body,
    });
  } catch (error) {
    const errorMessage = handleApiError(error, "Failed to fetch appointments");
    dispatch({ type: ADMIN_FETCH_APPOINTMENTS_FAILURE, payload: errorMessage });
  }
};

export const deleteAppointment = (appointmentId: string): AppThunk => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_DELETE_APPOINTMENT_REQUEST });
    const api = axiosWithAuth();

    await api.delete(`/api/appointments/${appointmentId}`);
    dispatch({ type: ADMIN_DELETE_APPOINTMENT_SUCCESS, payload: appointmentId });
  } catch (error) {
    const errorMessage = handleApiError(error, "Failed to delete appointment");
    dispatch({ type: ADMIN_DELETE_APPOINTMENT_FAILURE, payload: errorMessage });
  }
};

export const approveDoctorCredential = (
  doctorId: string, 
  _id: string,
  adminId: string
): AppThunk => async (dispatch) => {
  try {
    if (!adminId) {
      throw new Error("Admin ID is required");
    }
    dispatch({ type: ADMIN_APPROVE_DOCTOR_REQUEST });
    const api = axiosWithAuth();

    const response = await api.put<ApiResponse<Credential>>(
      `/api/doctors/${doctorId}/credentials/${_id}/approve`,
      { adminId }
    );

    dispatch({
      type: ADMIN_APPROVE_DOCTOR_SUCCESS,
      payload: response.data.body,
    });
  } catch (error) {
    const errorMessage = handleApiError(error, "Failed to approve credential");
    dispatch({ type: ADMIN_APPROVE_DOCTOR_FAILURE, payload: errorMessage });
  }
};

export const rejectDoctorCredential = (
  doctorId: string, 
  _id: string, 
  reason: string,
  adminId: string
): AppThunk => async (dispatch) => {
  try {
    if (!adminId) {
      throw new Error("Admin ID is required");
    }
    dispatch({ type: ADMIN_REJECT_DOCTOR_REQUEST });
    const api = axiosWithAuth();

    const response = await api.put<ApiResponse<Credential>>(
      `/api/doctors/${doctorId}/credentials/${_id}/reject`,
      { reason, adminId }
    );

    dispatch({
      type: ADMIN_REJECT_DOCTOR_SUCCESS,
      payload: response.data.body,
    });
  } catch (error) {
    const errorMessage = handleApiError(error, "Failed to reject credential");
    dispatch({ type: ADMIN_REJECT_DOCTOR_FAILURE, payload: errorMessage });
  }
};

export const fetchPendingCredentials = (): AppThunk => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_FETCH_CREDENTIALS_REQUEST });
    const api = axiosWithAuth();

    const response = await api.get<ApiResponse<Credential[]>>(
      "/api/doctors/credentials"
    );

    dispatch({
      type: ADMIN_FETCH_CREDENTIALS_SUCCESS,
      payload: response.data.body,
    });
  } catch (error) {
    const errorMessage = handleApiError(error, "Failed to fetch pending credentials");
    dispatch({ type: ADMIN_FETCH_CREDENTIALS_FAILURE, payload: errorMessage });
  }
};

export const fetchVideoLogs = (appointmentId: string): AppThunk => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_FETCH_VIDEO_LOGS_REQUEST });
    const api = axiosWithAuth();

    const response = await api.get<{ body: VideoLog[] }>(
      `/api/video/logs/${appointmentId}`
    );

    dispatch({
      type: ADMIN_FETCH_VIDEO_LOGS_SUCCESS,
      payload: response.data.body,
    });
  } catch (error) {
    const errorMessage = handleApiError(error, "Failed to fetch video logs");
    dispatch({ type: ADMIN_FETCH_VIDEO_LOGS_FAILURE, payload: errorMessage });
  }
};
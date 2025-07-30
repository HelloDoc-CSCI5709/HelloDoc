// Main Doctor interface - Fixed syntax and added proper export
export interface Doctor {
  isActive: boolean;
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  status: string;
  verified: boolean;
  _id: string;
  doctorId: {
    _id: string;
    fullName: string;
    email: string;
  };
  fullName?: string;
  dob?: Date;
  gender?: string;
  phone?: string;
  address?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  education?: string;
  specialization?: string | string[];
  bio?: string;
  profilePicture?: {
    filename: string;
    path: string;
  };
  isApproved?: boolean;
  experience?: number;
  rating?: number;
  consultationFee?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DoctorAvailability {
  _id: string;
  doctorId: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DoctorCredential {
  _id: string;
  id: string;
  doctorId: string;
  fileName: string;
  documentType: string;
  doctorEmail: string;
  doctorName: string;
  doctorProfilePicture: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminId?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DoctorState {
  profile: Doctor | null;
  availability: DoctorAvailability[];
  credentials: DoctorCredential[];
  doctorsList: Doctor[];
  publicProfile: Doctor | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  
  // Additional state for fetching doctors
  fetchLoading: boolean;
  fetchError: string | null;
  selectedDoctor: Doctor | null;
}

// Search and filter interfaces
export interface DoctorSearchParams {
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
}

export interface DoctorListResponse {
  doctors: Doctor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const DOCTOR_ACTION_TYPES = {
  // Profile actions
  GET_PROFILE_REQUEST: 'DOCTOR/GET_PROFILE_REQUEST',
  GET_PROFILE_SUCCESS: 'DOCTOR/GET_PROFILE_SUCCESS',
  GET_PROFILE_FAILURE: 'DOCTOR/GET_PROFILE_FAILURE',
  UPDATE_PROFILE_REQUEST: 'DOCTOR/UPDATE_PROFILE_REQUEST',
  UPDATE_PROFILE_SUCCESS: 'DOCTOR/UPDATE_PROFILE_SUCCESS',
  UPDATE_PROFILE_FAILURE: 'DOCTOR/UPDATE_PROFILE_FAILURE',
  UPLOAD_PROFILE_PICTURE_REQUEST: 'DOCTOR/UPLOAD_PROFILE_PICTURE_REQUEST',
  UPLOAD_PROFILE_PICTURE_SUCCESS: 'DOCTOR/UPLOAD_PROFILE_PICTURE_SUCCESS',
  UPLOAD_PROFILE_PICTURE_FAILURE: 'DOCTOR/UPLOAD_PROFILE_PICTURE_FAILURE',

  // Availability actions
  UPDATE_AVAILABILITY_REQUEST: 'DOCTOR/UPDATE_AVAILABILITY_REQUEST',
  UPDATE_AVAILABILITY_SUCCESS: 'DOCTOR/UPDATE_AVAILABILITY_SUCCESS',
  UPDATE_AVAILABILITY_FAILURE: 'DOCTOR/UPDATE_AVAILABILITY_FAILURE',
  GET_AVAILABILITY_REQUEST: 'DOCTOR/GET_AVAILABILITY_REQUEST',
  GET_AVAILABILITY_SUCCESS: 'DOCTOR/GET_AVAILABILITY_SUCCESS',
  GET_AVAILABILITY_FAILURE: 'DOCTOR/GET_AVAILABILITY_FAILURE',

  // Credential actions
  SUBMIT_CREDENTIAL_REQUEST: 'DOCTOR/SUBMIT_CREDENTIAL_REQUEST',
  SUBMIT_CREDENTIAL_SUCCESS: 'DOCTOR/SUBMIT_CREDENTIAL_SUCCESS',
  SUBMIT_CREDENTIAL_FAILURE: 'DOCTOR/SUBMIT_CREDENTIAL_FAILURE',
  GET_CREDENTIALS_REQUEST: 'DOCTOR/GET_CREDENTIALS_REQUEST',
  GET_CREDENTIALS_SUCCESS: 'DOCTOR/GET_CREDENTIALS_SUCCESS',
  GET_CREDENTIALS_FAILURE: 'DOCTOR/GET_CREDENTIALS_FAILURE',
  APPROVE_CREDENTIAL_REQUEST: 'DOCTOR/APPROVE_CREDENTIAL_REQUEST',
  APPROVE_CREDENTIAL_SUCCESS: 'DOCTOR/APPROVE_CREDENTIAL_SUCCESS',
  APPROVE_CREDENTIAL_FAILURE: 'DOCTOR/APPROVE_CREDENTIAL_FAILURE',
  REJECT_CREDENTIAL_REQUEST: 'DOCTOR/REJECT_CREDENTIAL_REQUEST',
  REJECT_CREDENTIAL_SUCCESS: 'DOCTOR/REJECT_CREDENTIAL_SUCCESS',
  REJECT_CREDENTIAL_FAILURE: 'DOCTOR/REJECT_CREDENTIAL_FAILURE',

  // Public and list actions
  GET_PUBLIC_PROFILE_REQUEST: 'DOCTOR/GET_PUBLIC_PROFILE_REQUEST',
  GET_PUBLIC_PROFILE_SUCCESS: 'DOCTOR/GET_PUBLIC_PROFILE_SUCCESS',
  GET_PUBLIC_PROFILE_FAILURE: 'DOCTOR/GET_PUBLIC_PROFILE_FAILURE',
  LIST_DOCTORS_REQUEST: 'DOCTOR/LIST_DOCTORS_REQUEST',
  LIST_DOCTORS_SUCCESS: 'DOCTOR/LIST_DOCTORS_SUCCESS',
  LIST_DOCTORS_FAILURE: 'DOCTOR/LIST_DOCTORS_FAILURE',

  // Fetch doctors actions (for appointment booking)
  FETCH_DOCTORS_REQUEST: 'DOCTOR/FETCH_DOCTORS_REQUEST',
  FETCH_DOCTORS_SUCCESS: 'DOCTOR/FETCH_DOCTORS_SUCCESS',
  FETCH_DOCTORS_FAILURE: 'DOCTOR/FETCH_DOCTORS_FAILURE',

  // Utility actions
  SELECT_DOCTOR: 'DOCTOR/SELECT_DOCTOR',
  RESET_DOCTOR_STATE: 'DOCTOR/RESET_DOCTOR_STATE',
  CLEAR_DOCTOR_ERROR: 'DOCTOR/CLEAR_DOCTOR_ERROR',
} as const;

// Type for action types
export type DoctorActionType = typeof DOCTOR_ACTION_TYPES[keyof typeof DOCTOR_ACTION_TYPES];

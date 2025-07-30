export interface PatientProfile {
  userId: string;
  mobile: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  allergies?: string;
  emergencyContact?: string;
  medicalNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientDocument {
  _id: string;
  userId: string;
  docType: 'healthcard-front' | 'healthcard-back' | 'insurance' | 'history' | 'allergy';
  fileName: string;
  uploadedAt: string;
}

export interface PatientState {
  profile: PatientProfile | null;
  documents: PatientDocument[];
  loading: boolean;
  error: string | null;
}

export const FETCH_PATIENT_PROFILE_REQUEST = 'FETCH_PATIENT_PROFILE_REQUEST';
export const FETCH_PATIENT_PROFILE_SUCCESS = 'FETCH_PATIENT_PROFILE_SUCCESS';
export const FETCH_PATIENT_PROFILE_FAILURE = 'FETCH_PATIENT_PROFILE_FAILURE';

export const UPDATE_PATIENT_PROFILE_REQUEST = 'UPDATE_PATIENT_PROFILE_REQUEST';
export const UPDATE_PATIENT_PROFILE_SUCCESS = 'UPDATE_PATIENT_PROFILE_SUCCESS';
export const UPDATE_PATIENT_PROFILE_FAILURE = 'UPDATE_PATIENT_PROFILE_FAILURE';

export const UPLOAD_DOCUMENT_REQUEST = 'UPLOAD_DOCUMENT_REQUEST';
export const UPLOAD_DOCUMENT_SUCCESS = 'UPLOAD_DOCUMENT_SUCCESS';
export const UPLOAD_DOCUMENT_FAILURE = 'UPLOAD_DOCUMENT_FAILURE';

export const FETCH_DOCUMENTS_REQUEST = 'FETCH_DOCUMENTS_REQUEST';
export const FETCH_DOCUMENTS_SUCCESS = 'FETCH_DOCUMENTS_SUCCESS';
export const FETCH_DOCUMENTS_FAILURE = 'FETCH_DOCUMENTS_FAILURE';

interface FetchPatientProfileRequest {
  type: typeof FETCH_PATIENT_PROFILE_REQUEST;
}

interface FetchPatientProfileSuccess {
  type: typeof FETCH_PATIENT_PROFILE_SUCCESS;
  payload: PatientProfile;
}

interface FetchPatientProfileFailure {
  type: typeof FETCH_PATIENT_PROFILE_FAILURE;
  payload: string;
}

interface UpdatePatientProfileRequest {
  type: typeof UPDATE_PATIENT_PROFILE_REQUEST;
}

interface UpdatePatientProfileSuccess {
  type: typeof UPDATE_PATIENT_PROFILE_SUCCESS;
  payload: PatientProfile;
}

interface UpdatePatientProfileFailure {
  type: typeof UPDATE_PATIENT_PROFILE_FAILURE;
  payload: string;
}

interface UploadDocumentRequest {
  type: typeof UPLOAD_DOCUMENT_REQUEST;
}

interface UploadDocumentSuccess {
  type: typeof UPLOAD_DOCUMENT_SUCCESS;
  payload: PatientDocument;
}

interface UploadDocumentFailure {
  type: typeof UPLOAD_DOCUMENT_FAILURE;
  payload: string;
}

interface FetchDocumentsRequest {
  type: typeof FETCH_DOCUMENTS_REQUEST;
}

interface FetchDocumentsSuccess {
  type: typeof FETCH_DOCUMENTS_SUCCESS;
  payload: PatientDocument[];
}

interface FetchDocumentsFailure {
  type: typeof FETCH_DOCUMENTS_FAILURE;
  payload: string;
}

export type PatientActionTypes =
  | FetchPatientProfileRequest
  | FetchPatientProfileSuccess
  | FetchPatientProfileFailure
  | UpdatePatientProfileRequest
  | UpdatePatientProfileSuccess
  | UpdatePatientProfileFailure
  | UploadDocumentRequest
  | UploadDocumentSuccess
  | UploadDocumentFailure
  | FetchDocumentsRequest
  | FetchDocumentsSuccess
  | FetchDocumentsFailure;
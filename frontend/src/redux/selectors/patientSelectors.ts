// src/redux/selectors/patientSelectors.ts
import type { RootState } from '../store';
import type { PatientProfile, PatientDocument } from '../types/patientTypes';

type PatientState = {
  profile: PatientProfile | null;
  documents: PatientDocument[];
  loading: boolean;
  error: string | null;
};

export const selectPatientProfile = (state: RootState) => (state.patient as PatientState).profile;
export const selectPatientDocuments = (state: RootState) => (state.patient as PatientState).documents;
export const selectPatientLoading = (state: RootState) => (state.patient as PatientState).loading;
export const selectPatientError = (state: RootState) => (state.patient as PatientState).error;

export const selectHealthCardFront = (state: RootState) => 
  (state.patient as PatientState).documents.find((doc) => doc.docType === 'healthcard-front');
export const selectHealthCardBack = (state: RootState) => 
  (state.patient as PatientState).documents.find((doc) => doc.docType === 'healthcard-back');
export const selectInsuranceDocument = (state: RootState) => 
  (state.patient as PatientState).documents.find((doc) => doc.docType === 'insurance');
export const selectAllergyDocument = (state: RootState) => 
  (state.patient as PatientState).documents.find((doc) => doc.docType === 'allergy');
export const selectMedicalHistory = (state: RootState) => 
  (state.patient as PatientState).documents.find((doc) => doc.docType === 'history');
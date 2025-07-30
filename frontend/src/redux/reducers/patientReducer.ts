import { type Reducer } from '@reduxjs/toolkit';
import {
    FETCH_PATIENT_PROFILE_FAILURE,
  UPDATE_PATIENT_PROFILE_REQUEST,
  UPDATE_PATIENT_PROFILE_SUCCESS,
  type PatientState,
  type PatientActionTypes,
  FETCH_PATIENT_PROFILE_REQUEST,
  FETCH_PATIENT_PROFILE_SUCCESS,
  UPDATE_PATIENT_PROFILE_FAILURE,
  UPLOAD_DOCUMENT_REQUEST,
  UPLOAD_DOCUMENT_SUCCESS,
  UPLOAD_DOCUMENT_FAILURE,
  FETCH_DOCUMENTS_REQUEST,
  FETCH_DOCUMENTS_SUCCESS,
  FETCH_DOCUMENTS_FAILURE,
} from '../types/patientTypes';

const initialState: PatientState = {
  profile: null,
  documents: [],
  loading: false,
  error: null,
};

function isPatientAction(action: { type: string }): action is PatientActionTypes {
  return Object.values([
    FETCH_PATIENT_PROFILE_REQUEST,
    FETCH_PATIENT_PROFILE_SUCCESS,
    FETCH_PATIENT_PROFILE_FAILURE,
    UPDATE_PATIENT_PROFILE_REQUEST,
    UPDATE_PATIENT_PROFILE_SUCCESS,
    UPDATE_PATIENT_PROFILE_FAILURE,
    UPLOAD_DOCUMENT_REQUEST,
    UPLOAD_DOCUMENT_SUCCESS,
    UPLOAD_DOCUMENT_FAILURE,
    FETCH_DOCUMENTS_REQUEST,
    FETCH_DOCUMENTS_SUCCESS,
    FETCH_DOCUMENTS_FAILURE
  ]).includes(action.type);
}

const patientReducer: Reducer<PatientState> = (
  state = initialState,
  action
) => {
  // Handle UnknownAction
  if (!isPatientAction(action)) {
    return state;
  }

  switch (action.type) {
    case FETCH_PATIENT_PROFILE_REQUEST:
    case UPDATE_PATIENT_PROFILE_REQUEST:
    case UPLOAD_DOCUMENT_REQUEST:
    case FETCH_DOCUMENTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_PATIENT_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        profile: action.payload,
        error: null,
      };

    case UPDATE_PATIENT_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        profile: action.payload,
        error: null,
      };

    case UPLOAD_DOCUMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        documents: [...state.documents, action.payload],
        error: null,
      };

    case FETCH_DOCUMENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        documents: action.payload,
        error: null,
      };

    case FETCH_PATIENT_PROFILE_FAILURE:
    case UPDATE_PATIENT_PROFILE_FAILURE:
    case UPLOAD_DOCUMENT_FAILURE:
    case FETCH_DOCUMENTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default patientReducer;
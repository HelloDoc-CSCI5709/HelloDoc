import { createSlice } from '@reduxjs/toolkit';
import {
  getDoctorPatients,
  getPatientHealthRecords,
  getPatientHPRecords,
  addHealthRecordNote,
  updateHealthRecord,
  getPatientPrescriptions,
  createPrescription,
  getPatientAppointments
} from '../actions/healthRecordActions';

interface HealthRecordState {
  patients: any[];
  selectedPatient: any | null;
  healthRecords: any;
  patientDocuments: any;
  handpRecord: any | null;
  prescriptions: any[];
  appointments: any[];
  loading: boolean;
  error: string | null;
}

const initialState: HealthRecordState = {
  patients: [],
  selectedPatient: null,
  healthRecords: {},
  patientDocuments: {},
  handpRecord: null,
  prescriptions: [],
  appointments: [],
  loading: false,
  error: null,
};

const healthRecordSlice = createSlice({
  name: 'healthRecord',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedPatient: (state, action) => {
      state.selectedPatient = action.payload;
    },
    clearHealthRecords: (state) => {
      state.healthRecords = {};
      state.patientDocuments = {};
      state.handpRecord = null;
      state.prescriptions = [];
      state.appointments = [];
      state.selectedPatient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Doctor Patients
      .addCase(getDoctorPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDoctorPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(getDoctorPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get Patient Health Records
      .addCase(getPatientHealthRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPatientHealthRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPatient = action.payload.patientInfo;
        state.healthRecords = action.payload.healthRecords;
        state.patientDocuments = action.payload.patientDocuments;
        state.handpRecord = action.payload.handpRecord;
      })
      .addCase(getPatientHealthRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Other cases for H&P records, prescriptions, etc.
      .addCase(getPatientHPRecords.fulfilled, (state, action) => {
        state.handpRecord = action.payload;
      })
      .addCase(addHealthRecordNote.fulfilled, (state, action) => {
        state.handpRecord = action.payload;
      })
      .addCase(updateHealthRecord.fulfilled, (state, action) => {
        state.handpRecord = action.payload;
      })
      .addCase(getPatientPrescriptions.fulfilled, (state, action) => {
        state.prescriptions = action.payload;
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.prescriptions.unshift(action.payload);
      })
      .addCase(getPatientAppointments.fulfilled, (state, action) => {
        state.appointments = action.payload;
      });
  },
});

export const { clearError, setSelectedPatient, clearHealthRecords } = healthRecordSlice.actions;
export default healthRecordSlice.reducer;

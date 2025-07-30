import { createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../../constant_url';

const fetchWithAuth = async <T>(url: string, options: RequestInit = {}): Promise<{ body: T }> => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

// Get doctor's patients using working API endpoint
export const getDoctorPatients = createAsyncThunk(
  'healthRecord/getDoctorPatients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any[]>('/api/appointments/');
      const appointments = response.body;
      
      const patientsMap = new Map();
      appointments.forEach((apt: any) => {
        if (apt.patientId) {
          const patientData = apt.patientId;
          const id = typeof patientData === 'object' ? patientData._id : patientData;
          const name = typeof patientData === 'object' ? patientData.fullName : 'Unknown Patient';
          const email = typeof patientData === 'object' ? patientData.email : '';
          
          if (!patientsMap.has(id)) {
            patientsMap.set(id, {
              _id: id,
              fullName: name,
              email: email || '',
              lastAppointment: apt.scheduledFor
            });
          }
        }
      });
      
      return Array.from(patientsMap.values());
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load patients');
    }
  }
);

// Get patient health records
export const getPatientHealthRecords = createAsyncThunk(
  'healthRecord/getPatientHealthRecords',
  async (patientId: string, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any>(`/api/patient/profile/${patientId}`);
      
      const patientData = response.body;
      return {
        patientId,
        patientInfo: {
          id: patientId,
          fullName: patientData.profile?.fullName || 'Unknown Patient',
          email: patientData.profile?.email || '',
          gender: patientData.profile?.gender || '',
          dob: patientData.profile?.dob || '',
          phone: patientData.profile?.mobile || '',
        },
        healthRecords: patientData.documents?.healthRecords || {},
        patientDocuments: patientData.documents?.patientDocuments || {},
        handpRecord: patientData.healthRecord || null
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load health records');
    }
  }
);

// Get H&P records with doctor notes
export const getPatientHPRecords = createAsyncThunk(
  'healthRecord/getPatientHPRecords',
  async (patientId: string, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any>(`/patient-handp/${patientId}`);
      return response.body;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load H&P records');
    }
  }
);

// Add doctor note to H&P
export const addHealthRecordNote = createAsyncThunk(
  'healthRecord/addHealthRecordNote',
  async ({ patientId, note }: { patientId: string; note: string }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any>(`/patient-handp/${patientId}/note`, {
        method: 'POST',
        body: JSON.stringify({ note })
      });
      return response.body;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add note');
    }
  }
);

// Update H&P fields
export const updateHealthRecord = createAsyncThunk(
  'healthRecord/updateHealthRecord',
  async ({ patientId, updateData }: { patientId: string; updateData: any }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any>(`/patient-handp/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      return response.body;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update health record');
    }
  }
);

// Get prescriptions for patient
export const getPatientPrescriptions = createAsyncThunk(
  'healthRecord/getPatientPrescriptions',
  async (patientId: string, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any[]>(`/api/prescriptions/`);
      return response.body;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load prescriptions');
    }
  }
);

// Create new prescription
export const createPrescription = createAsyncThunk(
  'healthRecord/createPrescription',
  async (prescriptionData: { patientId: string; medications: any[]; notes?: string; appointmentId?: string }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any>('/api/prescriptions', {
        method: 'POST',
        body: JSON.stringify(prescriptionData)
      });
      return response.body;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create prescription');
    }
  }
);

// Get appointments for patient timeline
export const getPatientAppointments = createAsyncThunk(
  'healthRecord/getPatientAppointments',
  async (patientId: string, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any[]>('/api/appointments/');
      const appointments = response.body;
      
      const patientAppointments = appointments.filter(apt => {
        const aptPatientId = typeof apt.patientId === 'object' ? apt.patientId._id : apt.patientId;
        return aptPatientId === patientId;
      });
      
      return patientAppointments;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load patient appointments');
    }
  }
);

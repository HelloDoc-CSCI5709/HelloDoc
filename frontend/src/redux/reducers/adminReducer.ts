import { createSlice, type PayloadAction, type ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { createAction } from '@reduxjs/toolkit';
import type { User, Credential, Appointment, VideoLog } from '../actions/adminActions';

export const ADMIN_FETCH_USERS_REQUEST = createAction('ADMIN_FETCH_USERS_REQUEST');
export const ADMIN_FETCH_USERS_SUCCESS = createAction<{ doctors: User[]; patients: User[] }>('ADMIN_FETCH_USERS_SUCCESS');
export const ADMIN_FETCH_USERS_FAILURE = createAction<string>('ADMIN_FETCH_USERS_FAILURE');
export const ADMIN_FETCH_APPOINTMENTS_REQUEST = createAction('ADMIN_FETCH_APPOINTMENTS_REQUEST');
export const ADMIN_FETCH_APPOINTMENTS_SUCCESS = createAction<Appointment[]>('ADMIN_FETCH_APPOINTMENTS_SUCCESS');
export const ADMIN_FETCH_APPOINTMENTS_FAILURE = createAction<string>('ADMIN_FETCH_APPOINTMENTS_FAILURE');
export const ADMIN_DELETE_APPOINTMENT_REQUEST = createAction('ADMIN_DELETE_APPOINTMENT_REQUEST');
export const ADMIN_DELETE_APPOINTMENT_SUCCESS = createAction<string>('ADMIN_DELETE_APPOINTMENT_SUCCESS');
export const ADMIN_DELETE_APPOINTMENT_FAILURE = createAction<string>('ADMIN_DELETE_APPOINTMENT_FAILURE');
export const ADMIN_APPROVE_DOCTOR_REQUEST = createAction('ADMIN_APPROVE_DOCTOR_REQUEST');
export const ADMIN_APPROVE_DOCTOR_SUCCESS = createAction<Credential>('ADMIN_APPROVE_DOCTOR_SUCCESS');
export const ADMIN_APPROVE_DOCTOR_FAILURE = createAction<string>('ADMIN_APPROVE_DOCTOR_FAILURE');
export const ADMIN_REJECT_DOCTOR_REQUEST = createAction('ADMIN_REJECT_DOCTOR_REQUEST');
export const ADMIN_REJECT_DOCTOR_SUCCESS = createAction<Credential>('ADMIN_REJECT_DOCTOR_SUCCESS');
export const ADMIN_REJECT_DOCTOR_FAILURE = createAction<string>('ADMIN_REJECT_DOCTOR_FAILURE');
export const ADMIN_FETCH_CREDENTIALS_REQUEST = createAction('ADMIN_FETCH_CREDENTIALS_REQUEST');
export const ADMIN_FETCH_CREDENTIALS_SUCCESS = createAction<Credential[]>('ADMIN_FETCH_CREDENTIALS_SUCCESS');
export const ADMIN_FETCH_CREDENTIALS_FAILURE = createAction<string>('ADMIN_FETCH_CREDENTIALS_FAILURE');
export const ADMIN_FETCH_VIDEO_LOGS_REQUEST = createAction('ADMIN_FETCH_VIDEO_LOGS_REQUEST');
export const ADMIN_FETCH_VIDEO_LOGS_SUCCESS = createAction<VideoLog[]>('ADMIN_FETCH_VIDEO_LOGS_SUCCESS');
export const ADMIN_FETCH_VIDEO_LOGS_FAILURE = createAction<string>('ADMIN_FETCH_VIDEO_LOGS_FAILURE');

interface AdminState {
  users: User[];
  appointments: Appointment[];
  credentials: Credential[];
  videoLogs: VideoLog[];
  loading: boolean;
  error: string | null;
  deleteSuccess: boolean;
  approveSuccess: boolean;
  rejectSuccess: boolean;
}

const initialState: AdminState = {
  users: [],
  appointments: [],
  credentials: [],
  videoLogs: [],
  loading: false,
  error: null,
  deleteSuccess: false,
  approveSuccess: false,
  rejectSuccess: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminState(state) {
      Object.assign(state, initialState);
    },
    clearAdminError(state) {
      state.error = null;
    },
    resetAdminSuccessFlags(state) {
      state.deleteSuccess = false;
      state.approveSuccess = false;
      state.rejectSuccess = false;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<AdminState>) => {
    // Users
    builder
      .addCase(ADMIN_FETCH_USERS_REQUEST, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ADMIN_FETCH_USERS_SUCCESS, (state, action: PayloadAction<{ doctors: User[]; patients: User[] }>) => {
        state.loading = false;
        state.users = [...action.payload.doctors, ...action.payload.patients];
      })
      .addCase(ADMIN_FETCH_USERS_FAILURE, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Appointments
    builder
      .addCase(ADMIN_FETCH_APPOINTMENTS_REQUEST, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ADMIN_FETCH_APPOINTMENTS_SUCCESS, (state, action: PayloadAction<Appointment[]>) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(ADMIN_FETCH_APPOINTMENTS_FAILURE, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Appointment
    builder
      .addCase(ADMIN_DELETE_APPOINTMENT_REQUEST, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(ADMIN_DELETE_APPOINTMENT_SUCCESS, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.deleteSuccess = true;
        state.appointments = state.appointments.filter((appt) => appt._id !== action.payload);
      })
      .addCase(ADMIN_DELETE_APPOINTMENT_FAILURE, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Approve Doctor
    builder
      .addCase(ADMIN_APPROVE_DOCTOR_REQUEST, (state) => {
        state.loading = true;
        state.error = null;
        state.approveSuccess = false;
      })
      .addCase(ADMIN_APPROVE_DOCTOR_SUCCESS, (state, action: PayloadAction<Credential>) => {
        state.loading = false;
        state.approveSuccess = true;
        state.credentials = state.credentials.map((cred) =>
          cred._id === action.payload._id ? action.payload : cred
        );
      })
      .addCase(ADMIN_APPROVE_DOCTOR_FAILURE, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Reject Doctor
    builder
      .addCase(ADMIN_REJECT_DOCTOR_REQUEST, (state) => {
        state.loading = true;
        state.error = null;
        state.rejectSuccess = false;
      })
      .addCase(ADMIN_REJECT_DOCTOR_SUCCESS, (state, action: PayloadAction<Credential>) => {
        state.loading = false;
        state.rejectSuccess = true;
        state.credentials = state.credentials.map((cred) =>
          cred._id === action.payload._id ? action.payload : cred
        );
      })
      .addCase(ADMIN_REJECT_DOCTOR_FAILURE, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Credentials
    builder
      .addCase(ADMIN_FETCH_CREDENTIALS_REQUEST, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ADMIN_FETCH_CREDENTIALS_SUCCESS, (state, action: PayloadAction<Credential[]>) => {
        state.loading = false;
        state.credentials = action.payload;
      })
      .addCase(ADMIN_FETCH_CREDENTIALS_FAILURE, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Video Logs
    builder
      .addCase(ADMIN_FETCH_VIDEO_LOGS_REQUEST, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ADMIN_FETCH_VIDEO_LOGS_SUCCESS, (state, action: PayloadAction<VideoLog[]>) => {
        state.loading = false;
        state.videoLogs = action.payload;
      })
      .addCase(ADMIN_FETCH_VIDEO_LOGS_FAILURE, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminState, clearAdminError, resetAdminSuccessFlags } = adminSlice.actions;
export default adminSlice.reducer;
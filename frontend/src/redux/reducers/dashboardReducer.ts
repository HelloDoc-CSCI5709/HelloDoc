import { createSlice } from '@reduxjs/toolkit';
import type{PayloadAction} from '@reduxjs/toolkit';
import {
  getDashboardStats,
  getTodayAppointments,
  getUpcomingAppointments,
  getPatientProfile,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  createVideoRoom,
  getVideoRoomToken
} from '../actions/dashboardActions';

interface Appointment {
  id: string;
  time?: string;
  start?: string;
  status?: string;
  doctorName?: string;
  patientName?: string;
  [key: string]: string | number | boolean | undefined;
}

interface PatientProfile {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  age?: number;
  address?: string;
  [key: string]: string | number | boolean | undefined;
}
interface DashboardStats {
  totalVisits: number;
  newPatients: number;
  oldPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  selectedPatient: PatientProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  todayAppointments: [],
  upcomingAppointments: [],
  selectedPatient: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearSelectedPatient: (state) => {
      state.selectedPatient = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getTodayAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTodayAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.loading = false;
        state.todayAppointments = action.payload;
      })
      .addCase(getTodayAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getUpcomingAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUpcomingAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.loading = false;
        state.upcomingAppointments = action.payload;
      })
      .addCase(getUpcomingAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getPatientProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPatientProfile.fulfilled, (state, action: PayloadAction<PatientProfile>) => {
        state.loading = false;
        state.selectedPatient = action.payload;
      })
      .addCase(getPatientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getAppointmentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAppointmentById.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        const cancelled = action.payload;
        state.todayAppointments = state.todayAppointments.map(apt =>
          apt.id === cancelled.id ? cancelled : apt
        );
        state.upcomingAppointments = state.upcomingAppointments.map(apt =>
          apt.id === cancelled.id ? cancelled : apt
        );
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(rescheduleAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        const updated = action.payload;
        state.todayAppointments = state.todayAppointments.map(apt =>
          apt.id === updated.id ? updated : apt
        );
        state.upcomingAppointments = state.upcomingAppointments.map(apt =>
          apt.id === updated.id ? updated : apt
        );
      })
      .addCase(rescheduleAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createVideoRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(createVideoRoom.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createVideoRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getVideoRoomToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVideoRoomToken.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getVideoRoomToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedPatient, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

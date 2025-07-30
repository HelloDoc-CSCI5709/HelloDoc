import { createSlice } from '@reduxjs/toolkit';
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

interface DashboardState {
  stats: {
    totalVisits: number;
    newPatients: number;
    oldPatients: number;
    todayAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
  } | null;
  todayAppointments: any[];
  upcomingAppointments: any[];
  selectedPatient: any | null;
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
      // Dashboard Stats
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Today's Appointments
      .addCase(getTodayAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTodayAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.todayAppointments = action.payload;
      })
      .addCase(getTodayAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Upcoming Appointments
      .addCase(getUpcomingAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUpcomingAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingAppointments = action.payload;
      })
      .addCase(getUpcomingAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Patient Profile (renamed from getDoctorPatients)
      .addCase(getPatientProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPatient = action.payload;
      })
      .addCase(getPatientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get Appointment By ID
      .addCase(getAppointmentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(getAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Cancel Appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        // Update appointments in state
        const cancelledAppointment = action.payload;
        state.todayAppointments = state.todayAppointments.map(apt =>
          apt.id === cancelledAppointment.id ? cancelledAppointment : apt
        );
        state.upcomingAppointments = state.upcomingAppointments.map(apt =>
          apt.id === cancelledAppointment.id ? cancelledAppointment : apt
        );
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reschedule Appointment
      .addCase(rescheduleAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const rescheduledAppointment = action.payload;
        state.todayAppointments = state.todayAppointments.map(apt =>
          apt.id === rescheduledAppointment.id ? rescheduledAppointment : apt
        );
        state.upcomingAppointments = state.upcomingAppointments.map(apt =>
          apt.id === rescheduledAppointment.id ? rescheduledAppointment : apt
        );
      })
      .addCase(rescheduleAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Video Room
      .addCase(createVideoRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(createVideoRoom.fulfilled, (state, action) => {
        state.loading = false;
        // Handle video room creation success
      })
      .addCase(createVideoRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get Video Room Token
      .addCase(getVideoRoomToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVideoRoomToken.fulfilled, (state, action) => {
        state.loading = false;
        // Handle video token retrieval success
      })
      .addCase(getVideoRoomToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedPatient, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Appointment, AppointmentState } from '../types/appointmentTypes';
import {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  markAsNoShow,
  deleteAppointment,
} from '../actions/appointmentActions';

const initialState: AppointmentState = {
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    clearSelectedAppointment: (state) => {
      state.selectedAppointment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        state.appointments.push(action.payload);
      })
      .addCase(bookAppointment.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(getAppointments.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointmentById.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        state.selectedAppointment = action.payload;
      })
      .addCase(getAppointmentById.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        const index = state.appointments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.selectedAppointment?._id === action.payload._id) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(cancelAppointment.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(rescheduleAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        const index = state.appointments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.selectedAppointment?._id === action.payload._id) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(rescheduleAppointment.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markAsNoShow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAsNoShow.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        const index = state.appointments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.selectedAppointment?._id === action.payload._id) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(markAsNoShow.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.appointments = state.appointments.filter(a => a._id !== action.payload);
        if (state.selectedAppointment?._id === action.payload) {
          state.selectedAppointment = null;
        }
      })
      .addCase(deleteAppointment.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedAppointment } = appointmentSlice.actions;
export default appointmentSlice.reducer;
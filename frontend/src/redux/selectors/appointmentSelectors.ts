import type { AppointmentState } from '../types/appointmentTypes';

export const selectAppointments = (state: { appointment: AppointmentState }) => 
  state.appointment.appointments;

export const selectSelectedAppointment = (state: { appointment: AppointmentState }) => 
  state.appointment.selectedAppointment;

export const selectAppointmentLoading = (state: { appointment: AppointmentState }) => 
  state.appointment.loading;

export const selectAppointmentError = (state: { appointment: AppointmentState }) => 
  state.appointment.error;
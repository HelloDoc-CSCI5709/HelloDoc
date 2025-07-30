import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Appointment, ApiResponse } from '../types/appointmentTypes';
import { BASE_URL } from '../../constant_url';

declare type RequestInit = globalThis.RequestInit;

interface ErrorResponse {
  message: string;
  [key: string]: unknown;
}

const fetchWithAuth = async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
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
    const errorData: ErrorResponse = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

export const bookAppointment = createAsyncThunk(
  'appointment/book',
  async (appointmentData: { doctorId: string; scheduledFor: string; reason: string }, { rejectWithValue }) => {
    try {
      const { body } = await fetchWithAuth<Appointment>('/appointments/book', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      });
      return body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const getAppointments = createAsyncThunk(
  'appointment/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { body } = await fetchWithAuth<Appointment[]>('/appointments');
      return body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const getAppointmentById = createAsyncThunk(
  'appointment/getById',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const { body } = await fetchWithAuth<Appointment>(`/appointments/${appointmentId}`);
      return body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointment/cancel',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const { body } = await fetchWithAuth<Appointment>(`/appointments/cancel/${appointmentId}`, {
        method: 'PUT',
      });
      return body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const rescheduleAppointment = createAsyncThunk(
  'appointment/reschedule',
  async (
    { appointmentId, scheduledFor, reason }: 
    { appointmentId: string; scheduledFor: string; reason?: string }, 
    { rejectWithValue }
  ) => {
    try {
      const { body } = await fetchWithAuth<Appointment>(`/appointments/reschedule/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ scheduledFor, reason }),
      });
      return body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const markAsNoShow = createAsyncThunk(
  'appointment/noShow',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const { body } = await fetchWithAuth<Appointment>(`/appointments/no-show/${appointmentId}`, {
        method: 'PUT',
      });
      return body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointment/delete',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      await fetchWithAuth<void>(`/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      return appointmentId;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);
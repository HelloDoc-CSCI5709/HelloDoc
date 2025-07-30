import { createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../../constant_url';

// Use your existing fetchWithAuth function structure
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

// Get all appointments for the doctor
export const getDoctorAppointments = createAsyncThunk(
  'dashboard/getDoctorAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any[]>('/appointments');
      return response.body;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load appointments');
    }
  }
);

// Get today's appointments (filter from all appointments)
export const getTodayAppointments = createAsyncThunk(
  'dashboard/getTodayAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any[]>('/appointments');
      const today = new Date().toISOString().split('T')[0];
      
      // Filter appointments for today
      const todayAppointments = response.body.filter(appointment => {
        const appointmentDate = new Date(appointment.scheduledFor).toISOString().split('T')[0];
        return appointmentDate === today;
      });
      
      return todayAppointments;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load today\'s appointments');
    }
  }
);

// Get upcoming appointments for calendar
export const getUpcomingAppointments = createAsyncThunk(
  'dashboard/getUpcomingAppointments',
  async ({ startDate, endDate }: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any[]>('/appointments');
      
      // Filter appointments within date range
      const upcomingAppointments = response.body.filter(appointment => {
        const appointmentDate = new Date(appointment.scheduledFor).toISOString().split('T')[0];
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });
      
      return upcomingAppointments;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load upcoming appointments');
    }
  }
);

// Get appointment by ID
export const getAppointmentById = createAsyncThunk(
  'dashboard/getAppointmentById',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any>(`/appointments/${appointmentId}`);
      return response.body;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load appointment details');
    }
  }
);

// Cancel appointment
export const cancelAppointment = createAsyncThunk(
  'dashboard/cancelAppointment',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any>(`/appointments/cancel/${appointmentId}`, {
        method: 'PUT',
      });
      return response.body;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel appointment');
    }
  }
);

// Reschedule appointment
export const rescheduleAppointment = createAsyncThunk(
  'dashboard/rescheduleAppointment',
  async ({ appointmentId, scheduledFor, reason }: { appointmentId: string; scheduledFor: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any>(`/appointments/reschedule/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ scheduledFor, reason }),
      });
      return response.body;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reschedule appointment');
    }
  }
);

// Get patient profile (renamed from getDoctorPatients since you don't have patients API)
export const getPatientProfile = createAsyncThunk(
  'dashboard/getPatientProfile',
  async (patientId: string, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any>('/patient/profile');
      return response.body;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load patient profile');
    }
  }
);

// Video call actions
export const createVideoRoom = createAsyncThunk(
  'dashboard/createVideoRoom',
  async ({ appointmentId, expiresInMinutes = 60 }: { appointmentId: string; expiresInMinutes?: number }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any>('/video/room', {
        method: 'POST',
        body: JSON.stringify({ appointmentId, expiresInMinutes }),
      });
      return response.body;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create video room');
    }
  }
);

export const getVideoRoomToken = createAsyncThunk(
  'dashboard/getVideoRoomToken',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any>(`/video/token/${appointmentId}`);
      return response.body;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get video room token');
    }
  }
);

// Generate dashboard stats from appointment data
export const getDashboardStats = createAsyncThunk(
  'dashboard/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<any[]>('/appointments');
      const appointments = response.body;
      
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const thisMonth = today.getMonth();
      const thisYear = today.getFullYear();
      
      // Calculate statistics
      const todayAppointments = appointments.filter(apt => 
        new Date(apt.scheduledFor).toISOString().split('T')[0] === todayString
      );
      
      const thisMonthAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.scheduledFor);
        return aptDate.getMonth() === thisMonth && aptDate.getFullYear() === thisYear;
      });
      
      const stats = {
        totalVisits: thisMonthAppointments.length,
        newPatients: thisMonthAppointments.filter(apt => apt.isNewPatient || false).length,
        oldPatients: thisMonthAppointments.filter(apt => !apt.isNewPatient).length,
        todayAppointments: todayAppointments.length,
        pendingAppointments: appointments.filter(apt => apt.status === 'scheduled').length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      };
      
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to calculate dashboard stats');
    }
  }
);

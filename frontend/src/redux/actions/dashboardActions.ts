import { createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../../constant_url';

interface Appointment {
  id: string;
  scheduledFor: string;
  status: string;
  isNewPatient?: boolean;
  [key: string]: unknown;
}

interface PatientProfile {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface VideoRoom {
  roomId: string;
  token: string;
  expiresAt: string;
}

interface DashboardStats {
  totalVisits: number;
  newPatients: number;
  oldPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
}

const fetchWithAuth = async <T>(url: string, options: globalThis.RequestInit = {}): Promise<{ body: T }> => {
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

// Appointments
export const getDoctorAppointments = createAsyncThunk<Appointment[]>(
  'dashboard/getDoctorAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<Appointment[]>('/appointments');
      return response.body;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to load appointments');
    }
  }
);

export const getTodayAppointments = createAsyncThunk<Appointment[]>(
  'dashboard/getTodayAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<Appointment[]>('/appointments');
      const today = new Date().toISOString().split('T')[0];
      const filtered = response.body.filter(apt => {
        const aptDate = new Date(apt.scheduledFor).toISOString().split('T')[0];
        return aptDate === today;
      });
      return filtered;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to load today\'s appointments');
    }
  }
);

export const getUpcomingAppointments = createAsyncThunk<Appointment[], { startDate: string; endDate: string }>(
  'dashboard/getUpcomingAppointments',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<Appointment[]>('/appointments');
      const filtered = response.body.filter(apt => {
        const aptDate = new Date(apt.scheduledFor).toISOString().split('T')[0];
        return aptDate >= startDate && aptDate <= endDate;
      });
      return filtered;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to load upcoming appointments');
    }
  }
);

export const getAppointmentById = createAsyncThunk<Appointment, string>(
  'dashboard/getAppointmentById',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<Appointment>(`/appointments/${appointmentId}`);
      return response.body;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to load appointment details');
    }
  }
);

export const cancelAppointment = createAsyncThunk<Appointment, string>(
  'dashboard/cancelAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<Appointment>(`/appointments/cancel/${appointmentId}`, {
        method: 'PUT',
      });
      return response.body;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to cancel appointment');
    }
  }
);

export const rescheduleAppointment = createAsyncThunk<
  Appointment,
  { appointmentId: string; scheduledFor: string; reason?: string }
>(
  'dashboard/rescheduleAppointment',
  async ({ appointmentId, scheduledFor, reason }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<Appointment>(`/appointments/reschedule/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ scheduledFor, reason }),
      });
      return response.body;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to reschedule appointment');
    }
  }
);

// Patient profile
export const getPatientProfile = createAsyncThunk<PatientProfile, string>(
  'dashboard/getPatientProfile',
  async (_patientId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<PatientProfile>('/patient/profile');
      return response.body;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to load patient profile');
    }
  }
);

// Video call
export const createVideoRoom = createAsyncThunk<VideoRoom, { appointmentId: string; expiresInMinutes?: number }>(
  'dashboard/createVideoRoom',
  async ({ appointmentId, expiresInMinutes = 60 }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<VideoRoom>('/video/room', {
        method: 'POST',
        body: JSON.stringify({ appointmentId, expiresInMinutes }),
      });
      return response.body;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to create video room');
    }
  }
);

export const getVideoRoomToken = createAsyncThunk<VideoRoom, string>(
  'dashboard/getVideoRoomToken',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<VideoRoom>(`/video/token/${appointmentId}`);
      return response.body;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to get video room token');
    }
  }
);

// Dashboard stats
export const getDashboardStats = createAsyncThunk<DashboardStats>(
  'dashboard/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth<Appointment[]>('/appointments');
      const appointments = response.body;

      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const thisMonth = today.getMonth();
      const thisYear = today.getFullYear();

      const todayAppointments = appointments.filter(apt =>
        new Date(apt.scheduledFor).toISOString().split('T')[0] === todayString
      );

      const thisMonthAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.scheduledFor);
        return aptDate.getMonth() === thisMonth && aptDate.getFullYear() === thisYear;
      });

      return {
        totalVisits: thisMonthAppointments.length,
        newPatients: thisMonthAppointments.filter(apt => apt.isNewPatient).length,
        oldPatients: thisMonthAppointments.filter(apt => !apt.isNewPatient).length,
        todayAppointments: todayAppointments.length,
        pendingAppointments: appointments.filter(apt => apt.status === 'scheduled').length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      };
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to calculate dashboard stats');
    }
  }
);

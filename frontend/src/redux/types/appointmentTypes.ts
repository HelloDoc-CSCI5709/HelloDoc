export interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  scheduledFor: string;
  date: string;
  time: string;
  reason: string;
  status: string;
}

export interface AppointmentState {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  body: T;
  message?: string;
}
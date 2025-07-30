export const ADMIN_FETCH_USERS_REQUEST = 'ADMIN_FETCH_USERS_REQUEST' as const;
export const ADMIN_FETCH_USERS_SUCCESS = 'ADMIN_FETCH_USERS_SUCCESS' as const;
export const ADMIN_FETCH_USERS_FAILURE = 'ADMIN_FETCH_USERS_FAILURE' as const;

export const ADMIN_FETCH_APPOINTMENTS_REQUEST = 'ADMIN_FETCH_APPOINTMENTS_REQUEST' as const;
export const ADMIN_FETCH_APPOINTMENTS_SUCCESS = 'ADMIN_FETCH_APPOINTMENTS_SUCCESS' as const;
export const ADMIN_FETCH_APPOINTMENTS_FAILURE = 'ADMIN_FETCH_APPOINTMENTS_FAILURE' as const;

export const ADMIN_DELETE_APPOINTMENT_REQUEST = 'ADMIN_DELETE_APPOINTMENT_REQUEST' as const;
export const ADMIN_DELETE_APPOINTMENT_SUCCESS = 'ADMIN_DELETE_APPOINTMENT_SUCCESS' as const;
export const ADMIN_DELETE_APPOINTMENT_FAILURE = 'ADMIN_DELETE_APPOINTMENT_FAILURE' as const;

export const ADMIN_APPROVE_DOCTOR_REQUEST = 'ADMIN_APPROVE_DOCTOR_REQUEST' as const;
export const ADMIN_APPROVE_DOCTOR_SUCCESS = 'ADMIN_APPROVE_DOCTOR_SUCCESS' as const;
export const ADMIN_APPROVE_DOCTOR_FAILURE = 'ADMIN_APPROVE_DOCTOR_FAILURE' as const;

export const ADMIN_REJECT_DOCTOR_REQUEST = 'ADMIN_REJECT_DOCTOR_REQUEST' as const;
export const ADMIN_REJECT_DOCTOR_SUCCESS = 'ADMIN_REJECT_DOCTOR_SUCCESS' as const;
export const ADMIN_REJECT_DOCTOR_FAILURE = 'ADMIN_REJECT_DOCTOR_FAILURE' as const;

export const ADMIN_FETCH_CREDENTIALS_REQUEST = 'ADMIN_FETCH_CREDENTIALS_REQUEST' as const;
export const ADMIN_FETCH_CREDENTIALS_SUCCESS = 'ADMIN_FETCH_CREDENTIALS_SUCCESS' as const;
export const ADMIN_FETCH_CREDENTIALS_FAILURE = 'ADMIN_FETCH_CREDENTIALS_FAILURE' as const;

export const ADMIN_FETCH_VIDEO_LOGS_REQUEST = 'ADMIN_FETCH_VIDEO_LOGS_REQUEST' as const;
export const ADMIN_FETCH_VIDEO_LOGS_SUCCESS = 'ADMIN_FETCH_VIDEO_LOGS_SUCCESS' as const;
export const ADMIN_FETCH_VIDEO_LOGS_FAILURE = 'ADMIN_FETCH_VIDEO_LOGS_FAILURE' as const;

export const ADMIN_RESET_DELETE_SUCCESS = 'ADMIN_RESET_DELETE_SUCCESS' as const;
export const ADMIN_RESET_APPROVE_SUCCESS = 'ADMIN_RESET_APPROVE_SUCCESS' as const;
export const ADMIN_RESET_REJECT_SUCCESS = 'ADMIN_RESET_REJECT_SUCCESS' as const;


// Type Definitions
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  profilePicture?: string;
  isVerified: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  specialization?: string[];
  credentials?: DoctorCredential[];
  mobile?: string;
}

export interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  scheduledFor: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  reason?: string;
  createdAt: string;
  updatedAt: string;
  type?: 'in-person' | 'video' | 'phone';
  duration?: number;
  notes?: string;
  address?: string;
  postalCode?: string;
}

export interface DoctorCredential {
  _id: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  doctorProfilePicture?: string;
  documentType: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  adminId?: string;
  reason?: string;
}

export interface VideoLog {
  _id: string;
  appointmentId: string;
  roomId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'patient' | 'doctor';
  joinedAt: string;
  leftAt?: string;
  durationMin?: number;
}

// State Type
export interface AdminState {
  users: User[];
  appointments: Appointment[];
  credentials: DoctorCredential[];
  videoLogs: VideoLog[];
  loading: boolean;
  error: string | null;
  deleteSuccess: boolean;
  approveSuccess: boolean;
  rejectSuccess: boolean;
}

// Complete Action Interfaces
interface FetchUsersRequestAction {
  type: typeof ADMIN_FETCH_USERS_REQUEST;
}

interface FetchUsersSuccessAction {
  type: typeof ADMIN_FETCH_USERS_SUCCESS;
  payload: User[];
}

interface FetchUsersFailureAction {
  type: typeof ADMIN_FETCH_USERS_FAILURE;
  payload: string;
}

interface FetchAppointmentsRequestAction {
  type: typeof ADMIN_FETCH_APPOINTMENTS_REQUEST;
}

interface FetchAppointmentsSuccessAction {
  type: typeof ADMIN_FETCH_APPOINTMENTS_SUCCESS;
  payload: Appointment[];
}

interface FetchAppointmentsFailureAction {
  type: typeof ADMIN_FETCH_APPOINTMENTS_FAILURE;
  payload: string;
}

interface DeleteAppointmentRequestAction {
  type: typeof ADMIN_DELETE_APPOINTMENT_REQUEST;
}

interface DeleteAppointmentSuccessAction {
  type: typeof ADMIN_DELETE_APPOINTMENT_SUCCESS;
  payload: string; // appointment ID
}

interface DeleteAppointmentFailureAction {
  type: typeof ADMIN_DELETE_APPOINTMENT_FAILURE;
  payload: string;
}

interface ApproveDoctorRequestAction {
  type: typeof ADMIN_APPROVE_DOCTOR_REQUEST;
}

interface ApproveDoctorSuccessAction {
  type: typeof ADMIN_APPROVE_DOCTOR_SUCCESS;
  payload: DoctorCredential;
}

interface ApproveDoctorFailureAction {
  type: typeof ADMIN_APPROVE_DOCTOR_FAILURE;
  payload: string;
}

interface RejectDoctorRequestAction {
  type: typeof ADMIN_REJECT_DOCTOR_REQUEST;
}

interface RejectDoctorSuccessAction {
  type: typeof ADMIN_REJECT_DOCTOR_SUCCESS;
  payload: DoctorCredential;
}

interface RejectDoctorFailureAction {
  type: typeof ADMIN_REJECT_DOCTOR_FAILURE;
  payload: string;
}

interface FetchCredentialsRequestAction {
  type: typeof ADMIN_FETCH_CREDENTIALS_REQUEST;
}

interface FetchCredentialsSuccessAction {
  type: typeof ADMIN_FETCH_CREDENTIALS_SUCCESS;
  payload: DoctorCredential[];
}

interface FetchCredentialsFailureAction {
  type: typeof ADMIN_FETCH_CREDENTIALS_FAILURE;
  payload: string;
}

interface FetchVideoLogsRequestAction {
  type: typeof ADMIN_FETCH_VIDEO_LOGS_REQUEST;
}

interface FetchVideoLogsSuccessAction {
  type: typeof ADMIN_FETCH_VIDEO_LOGS_SUCCESS;
  payload: VideoLog[];
}

interface FetchVideoLogsFailureAction {
  type: typeof ADMIN_FETCH_VIDEO_LOGS_FAILURE;
  payload: string;
}

// Reset action interfaces
interface ResetDeleteSuccessAction {
  type: typeof ADMIN_RESET_DELETE_SUCCESS;
}

interface ResetApproveSuccessAction {
  type: typeof ADMIN_RESET_APPROVE_SUCCESS;
}

interface ResetRejectSuccessAction {
  type: typeof ADMIN_RESET_REJECT_SUCCESS;
}

// Union type for all admin actions
export type AdminActionTypes =
  | FetchUsersRequestAction
  | FetchUsersSuccessAction
  | FetchUsersFailureAction
  | FetchAppointmentsRequestAction
  | FetchAppointmentsSuccessAction
  | FetchAppointmentsFailureAction
  | DeleteAppointmentRequestAction
  | DeleteAppointmentSuccessAction
  | DeleteAppointmentFailureAction
  | ApproveDoctorRequestAction
  | ApproveDoctorSuccessAction
  | ApproveDoctorFailureAction
  | RejectDoctorRequestAction
  | RejectDoctorSuccessAction
  | RejectDoctorFailureAction
  | FetchCredentialsRequestAction
  | FetchCredentialsSuccessAction
  | FetchCredentialsFailureAction
  | FetchVideoLogsRequestAction
  | FetchVideoLogsSuccessAction
  | FetchVideoLogsFailureAction
  | ResetDeleteSuccessAction
  | ResetApproveSuccessAction
  | ResetRejectSuccessAction;

// Utility types for filtering
export interface AdminFilters {
  search?: string;
  status?: string;
  role?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Response types
export interface AdminResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: AdminPagination;
}

// Specific API Response types - Replace empty interfaces with type aliases
export type AdminUsersResponse = AdminResponse<User[]>;
export type AdminAppointmentsResponse = AdminResponse<Appointment[]>;
export type AdminCredentialsResponse = AdminResponse<DoctorCredential[]>;
export type AdminVideoLogsResponse = AdminResponse<VideoLog[]>;

// Additional utility types
export interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  pendingCredentials: number;
  activeVideoSessions: number;
}

export interface AdminDashboardData {
  stats: AdminStats;
  recentAppointments: Appointment[];
  pendingCredentials: DoctorCredential[];
  recentVideoLogs: VideoLog[];
}

// Form data types
export interface AdminUserFormData {
  name: string;
  email: string;
  role: User['role'];
  isActive: boolean;
  specialization?: string[];
}

export interface AdminAppointmentFormData {
  patientId: string;
  doctorId: string;
  scheduledFor: string;
  type: Appointment['type'];
  reason?: string;
  notes?: string;
}

// Search and filter types
export interface AdminSearchParams {
  query?: string;
  role?: User['role'];
  status?: Appointment['status'] | DoctorCredential['status'];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Error types
export interface AdminError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Notification types
export interface AdminNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Export all interfaces and types
export type {
  User as AdminUser,
  Appointment as AdminAppointment,
  DoctorCredential as AdminDoctorCredential,
  VideoLog as AdminVideoLog
};
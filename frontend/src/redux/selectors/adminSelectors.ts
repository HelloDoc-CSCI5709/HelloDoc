import type { RootState } from "../store";
import type { User, Credential, Appointment } from "../actions/adminActions";

export const selectUsers = (state: RootState) => state.admin.users;
export const selectAppointments = (state: RootState) => state.admin.appointments;
export const selectCredentials = (state: RootState) => state.admin.credentials;
export const selectVideoLogs = (state: RootState) => state.admin.videoLogs;
export const selectLoading = (state: RootState) => state.admin.loading;
export const selectError = (state: RootState) => state.admin.error;
export const selectDeleteSuccess = (state: RootState) => state.admin.deleteSuccess;
export const selectApproveSuccess = (state: RootState) => state.admin.approveSuccess;
export const selectRejectSuccess = (state: RootState) => state.admin.rejectSuccess;

export const selectPendingCredentials = (state: RootState) =>
  state.admin.credentials.filter((cred: Credential) => cred.status === 'Pending');

export const selectApprovedDoctors = (state: RootState) =>
  state.admin.users.filter(
    (user: User) =>
      user.role === 'doctor' && user.credentialStatus?.status === 'Approved'
  );

export const selectPendingDoctors = (state: RootState) =>
  state.admin.users.filter(
    (user: User) =>
      user.role === 'doctor' &&
      (user.credentialStatus?.status === 'Pending' ||
        user.credentialStatus?.status === 'Not Submitted')
  );

export const selectActiveAppointments = (state: RootState) =>
  state.admin.appointments.filter((appt: Appointment) =>
    ['scheduled', 'rescheduled'].includes(appt.status)
  );

export const selectCompletedAppointments = (state: RootState) =>
  state.admin.appointments.filter((appt: Appointment) =>
    ['completed', 'no-show'].includes(appt.status)
  );
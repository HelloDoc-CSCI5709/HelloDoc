import type { RootState } from '../store';

export const selectDoctorProfile = (state: RootState) => state.doctor.profile;
export const selectDoctorAvailability = (state: RootState) => state.doctor.availability;
export const selectDoctorCredentials = (state: RootState) => state.doctor.credentials;
export const selectDoctorsList = (state: RootState) => state.doctor.doctorsList;
export const selectPublicDoctorProfile = (state: RootState) => state.doctor.publicProfile;
export const selectDoctorLoading = (state: RootState) => state.doctor.loading;
export const selectDoctorError = (state: RootState) => state.doctor.error;
export const selectDoctorSuccess = (state: RootState) => state.doctor.success;

export const selectApprovedCredentials = (state: RootState) => 
  state.doctor.credentials.filter(cred => cred.status === 'Approved');
export const selectPendingCredentials = (state: RootState) => 
  state.doctor.credentials.filter(cred => cred.status === 'Pending');
export const selectRejectedCredentials = (state: RootState) => 
  state.doctor.credentials.filter(cred => cred.status === 'Rejected');

export const selectDoctorSpecializations = (state: RootState) => 
  state.doctor.profile?.specialization || [];
export const selectDoctorProfilePicture = (state: RootState) => 
  state.doctor.profile?.profilePicture;
import { type UserState } from '../types/userTypes';

export const selectCurrentUser = (state: { user: UserState }) => state.user.currentUser;
export const selectUserId = (state: { user: UserState }) => state.user.userId;
export const selectUserRole = (state: { user: UserState }) => state.user.role;
export const selectUserProfile = (state: { user: UserState }) => state.user.currentUser?.profile;
export const selectUserLoading = (state: { user: UserState }) => state.user.loading;
export const selectUserError = (state: { user: UserState }) => state.user.error;
export const selectVerificationStatus = (state: { user: UserState }) => state.user.verificationStatus;
export const selectIsVerified = (state: { user: UserState }) => 
  state.user.verificationStatus === 'verified';

export const selectDoctors = (state: { user: UserState }) => state.user.doctors || [];
export const selectDoctorsLoading = (state: { user: UserState }) => state.user.doctorsLoading || false;
export const selectDoctorsError = (state: { user: UserState }) => state.user.doctorsError;
export const selectSelectedDoctor = (state: { user: UserState }) => state.user.selectedDoctor;
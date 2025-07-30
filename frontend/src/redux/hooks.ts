import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

import {
  selectAccessToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthState
} from './selectors/authSelectors';

import {
  selectCurrentUser,
  selectUserRole,
  selectUserProfile,
  selectVerificationStatus,
  selectIsVerified
} from './selectors/userSelectors';

import {
  createRoom,
  getRoomToken,
  logStart,
  logEnd,
  getLogs,
} from './actions/videoActions'

import {
  selectVideoRoom,
  selectVideoLogs,
  selectVideoLoading,
  selectVideoError,
} from './selectors/videoSelectors'


export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAccessToken = () => useAppSelector(selectAccessToken);
export const useIsAuthenticated = () => useAppSelector(selectIsAuthenticated);
export const useAuthLoading = () => useAppSelector(selectAuthLoading);
export const useAuthError = () => useAppSelector(selectAuthError);
export const useAuth = () => useAppSelector(selectAuthState);

export const useUser = () => useAppSelector(selectCurrentUser);
export const useUserRole = () => useAppSelector(selectUserRole);
export const useUserProfile = () => useAppSelector(selectUserProfile);
export const useVerificationStatus = () => useAppSelector(selectVerificationStatus);
export const useIsVerified = () => useAppSelector(selectIsVerified);

export const useAppointments = () => useAppSelector((state) => state.appointment.appointments);
export const useSelectedAppointment = () => useAppSelector((state) => state.appointment.selectedAppointment);
export const useAppointmentLoading = () => useAppSelector((state) => state.appointment.loading);
export const useAppointmentError = () => useAppSelector((state) => state.appointment.error);

export const useVideoRoom = () => useAppSelector(selectVideoRoom)
export const useVideoLogs = () => useAppSelector(selectVideoLogs)
export const useVideoLoading = () => useAppSelector(selectVideoLoading)
export const useVideoError = () => useAppSelector(selectVideoError)

export const useUpcomingAppointments = () => 
  useAppSelector((state) => 
    state.appointment.appointments.filter(
      (appt) => new Date(appt.scheduledFor) > new Date()
    )
  );

export const usePastAppointments = () => 
  useAppSelector((state) => 
    state.appointment.appointments.filter(
      (appt) => new Date(appt.scheduledFor) <= new Date()
    )
  );

export const useDoctorAppointments = (doctorId: string) => 
  useAppSelector((state) => 
    state.appointment.appointments.filter(
      (appt) => appt.doctorId === doctorId
    )
  );

export const usePatientAppointments = (patientId: string) =>
  useAppSelector((state) =>
    state.appointment.appointments.filter(
      (appt) => appt.patientId === patientId
    )
  );

  export const useCreateRoom = () => {
  const dispatch = useAppDispatch()
  return (appointmentId: string, expiresInMinutes?: number) =>
    dispatch(createRoom({ appointmentId, expiresInMinutes }))
}

export const useGetRoomToken = () => {
  const dispatch = useAppDispatch()
  return (appointmentId: string) => dispatch(getRoomToken(appointmentId))
}

export const useLogStart = () => {
  const dispatch = useAppDispatch()
  return (appointmentId: string, roomId: string) =>
    dispatch(logStart({ appointmentId, roomId }))
}

export const useLogEnd = () => {
  const dispatch = useAppDispatch()
  return (logId: string) => dispatch(logEnd(logId))
}

export const useGetLogs = () => {
  const dispatch = useAppDispatch()
  return (appointmentId: string) => dispatch(getLogs(appointmentId))
}
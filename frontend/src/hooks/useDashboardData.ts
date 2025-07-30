import { useEffect } from 'react';
import { useAppDispatch } from '../redux/hooks';
import {
  getDashboardStats,
  getTodayAppointments,
  getUpcomingAppointments,
  getDoctorPatients
} from '../redux/actions/dashboardActions';

export const useDashboardData = (doctorId: string) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (doctorId) {
        
      dispatch(getDashboardStats(doctorId));
      dispatch(getTodayAppointments(doctorId));
      dispatch(getDoctorPatients(doctorId));

      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];
      dispatch(getUpcomingAppointments({ doctorId, startDate, endDate }));
    }
  }, [dispatch, doctorId]);

  useEffect(() => {
    if (doctorId) {
      const interval = setInterval(() => {
        dispatch(getTodayAppointments(doctorId));
        dispatch(getDashboardStats(doctorId));
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [dispatch, doctorId]);
};

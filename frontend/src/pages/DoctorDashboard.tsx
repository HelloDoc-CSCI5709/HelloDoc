import React, { useEffect, useState } from 'react';
import DoctorSidebar from '../components/Doctor/DoctorSidebar';
import AppointmentsList from '../components/Doctor/Dashboard/AppointmentsList';
import AppointmentCalendar from '../components/Doctor/Dashboard/AppointmentCalendar';
import DashboardMetrics from '../components/Doctor/Dashboard/DashboardMetrics';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { 
  getDashboardStats, 
  getTodayAppointments, 
  getUpcomingAppointments,
  getPatientProfile 
} from '../redux/actions/dashboardActions';
import { getDoctorProfile } from '../redux/actions/doctorActions';

const DoctorDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector(state => state.doctor);
  const { stats, todayAppointments, upcomingAppointments, loading } = useAppSelector(state => state.dashboard);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!profile) {
      dispatch(getDoctorProfile(null));
    }

    dispatch(getDashboardStats());
    dispatch(getTodayAppointments());

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];
    dispatch(getUpcomingAppointments({ startDate, endDate }));
  }, [dispatch, profile]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(getTodayAppointments());
      dispatch(getDashboardStats());
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handlePatientSelect = (patientId: string) => {
    dispatch(getPatientProfile(patientId));
  };

  const profilePicUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.user?.fullName || 'Doctor')}&background=0D8ABC&color=fff`;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-[80px] bg-blue-600 text-white">
        <DoctorSidebar />
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 bg-gray-200 flex-shrink-0">
                  <img
                    src={profilePicUrl}
                    alt="Doctor Profile"
                    className="w-full h-full object-cover"
                  />
                  
                </div>
              <div className="text-sm">
                <p className="font-medium text-gray-700">{profile?.user?.fullName || 'Doctor'}</p>
                <p className="text-gray-500 text-xs">{profile?.user?.email || ''}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {getTimeBasedGreeting()} <span className="text-blue-600">
                  {profile?.user?.fullName?.split(' ')[0] || 'Doctor'}!
                </span>
              </h1>
              <p className="text-gray-600">Here's what's happening in your practice today.</p>
            </div>

            <div className="mb-8">
              <DashboardMetrics stats={stats} loading={loading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <AppointmentsList 
                  appointments={todayAppointments || []}
                  onPatientSelect={handlePatientSelect}
                  loading={loading}
                />
              </div>

              <div className="space-y-6">
                <AppointmentCalendar 
                  appointments={upcomingAppointments || []}
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Real Data Dashboard</h4>
                <p className="text-sm text-blue-800">
                  This dashboard uses your actual appointment and patient APIs to show real-time data.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">🎥 Video Integration</h4>
                <p className="text-sm text-green-800">
                  Click "Join" on any appointment to start a video consultation with your patient.
                </p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Calendar Features</h4>
                <p className="text-sm text-purple-800">
                  View all appointments in calendar format and join video calls directly from the calendar.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;

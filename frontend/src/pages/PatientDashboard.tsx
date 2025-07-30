import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MessageCircle, User, Activity, Bell, ChevronRight, Plus, Video, FileText, Heart, TrendingUp } from 'lucide-react';
import TopNavBar from '../components/Patient/TopNavbar';
import LeftSidebar from '../components/Patient/LeftSidebar';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { getAppointments } from '../redux/actions/appointmentActions';
import { selectCurrentUser } from '../redux/selectors/userSelectors';
import { selectAppointments, selectAppointmentLoading } from '../redux/selectors/appointmentSelectors';
import { format, isToday, isTomorrow, isThisWeek, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';
interface QuickStat {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

const PatientDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const appointments = useAppSelector(selectAppointments);
  const loading = useAppSelector(selectAppointmentLoading);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();
  

  useEffect(() => {
    if (user?.id) {
      dispatch(getAppointments());
    }
  }, [dispatch, user?.id]);

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

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.scheduledFor) > now && apt.status !== 'cancelled')
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
      .slice(0, 3);
  };

  const getTodayAppointments = () => {
    return appointments.filter(apt => 
      isToday(parseISO(apt.scheduledFor)) && apt.status !== 'cancelled'
    );
  };

  const getThisWeekAppointments = () => {
    return appointments.filter(apt => 
      isThisWeek(parseISO(apt.scheduledFor)) && apt.status !== 'cancelled'
    );
  };

  const quickStats: QuickStat[] = [
    {
      title: 'Today\'s Visits',
      value: getTodayAppointments().length.toString(),
      icon: <Calendar className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      change: '+2 from yesterday',
      trend: 'up'
    },
    {
      title: 'This Week',
      value: getThisWeekAppointments().length.toString(),
      icon: <Clock className="w-5 h-5" />,
      color: 'from-emerald-500 to-emerald-600',
      change: '+5 from last week',
      trend: 'up'
    },
    {
      title: 'Total Appointments',
      value: appointments.length.toString(),
      icon: <Activity className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
      change: '+12 this month',
      trend: 'up'
    },
    {
      title: 'Health Score',
      value: '85%',
      icon: <Heart className="w-5 h-5" />,
      color: 'from-pink-500 to-pink-600',
      change: '+5% improvement',
      trend: 'up'
    }
  ];

  // Calendar functionality
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(parseISO(apt.scheduledFor), date) && apt.status !== 'cancelled'
    );
  };

  const formatAppointmentTime = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`;
    return format(date, 'MMM dd, h:mm a');
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="w-[80px] bg-blue-600">
          <LeftSidebar />
        </div>
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="w-full border-b shadow-sm bg-white/80 backdrop-blur">
            <TopNavBar />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[80px] bg-blue-600">
        <LeftSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        {/* Top Navbar */}
        <div className="w-full border-b shadow-sm bg-white/80 backdrop-blur sticky top-0 z-40">
          <TopNavBar />
        </div>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Welcome Section with Enhanced Design */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-3xl p-6 md:p-8 shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full"></div>
                <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white rounded-full"></div>
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {getTimeBasedGreeting()}, {user?.profile?.fullName || 'Patient'}!
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {format(currentTime, 'EEEE, MMMM do, yyyy')}
                  </p>
                  <p className="text-blue-200 text-sm mt-2">
                    Welcome back to your health dashboard
                  </p>
                </div>
                <div className="text-right bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <p className="text-sm text-blue-200 mb-1">Current Time</p>
                  <p className="text-2xl font-bold">
                    {format(currentTime, 'h:mm a')}
                  </p>
                  <p className="text-xs text-blue-300 mt-1">
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {quickStats.map((stat, statIndex) => (
                <div key={statIndex} className="group relative bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`bg-gradient-to-r ${stat.color} text-white p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {stat.icon}
                    </div>
                    {stat.trend === 'up' && (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Upcoming Appointments - Enhanced */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 md:p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
                    </div>
<button
  onClick={() => navigate('/appointments')}
  className="text-blue-600 text-sm hover:underline flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full"
>
  <span>View All</span>
  <ChevronRight className="w-4 h-4" />
</button>
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  {getUpcomingAppointments().length > 0 ? (
                    <div className="space-y-4">
                      {getUpcomingAppointments().map((appointment) => (
                        <div key={appointment._id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <User className="w-7 h-7 text-white" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg">
                                Dr. {appointment.doctorId}
                              </h3>
                              <p className="text-blue-600 font-medium">
                                {formatAppointmentTime(appointment.scheduledFor)}
                              </p>
                              <p className="text-gray-600 text-sm mt-1">
                                {appointment.reason}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700`}>
                              {appointment.status}
                            </span>
                            <div className="flex items-center space-x-2 mt-2">
                              <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                                <Video className="w-4 h-4 text-blue-600" />
                              </button>
                              <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                <MessageCircle className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No upcoming appointments</h3>
                      <p className="text-gray-500 mb-4">Schedule your next consultation with a healthcare provider</p>
                      <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2 mx-auto">
                        <Plus className="w-5 h-5" />
                        <span>Book Appointment</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar with Calendar and Actions */}
              <div className="space-y-6">
                
                {/* Mini Calendar */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800">Calendar</h3>
                      <div className="flex items-center space-x-2">
                        <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded">
                          <ChevronRight className="w-4 h-4 text-gray-600 transform rotate-180" />
                        </button>
                        <span className="text-sm font-medium text-gray-600 min-w-[100px] text-center">
                          {format(currentMonth, 'MMM yyyy')}
                        </span>
                        <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded">
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth().map(day => {
                        const hasAppointments = getAppointmentsForDate(day).length > 0;
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        
                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => setSelectedDate(day)}
                            className={`
                              relative p-2 text-sm rounded-lg transition-all duration-200
                              ${isSelected 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : isCurrentMonth 
                                  ? 'hover:bg-blue-50 text-gray-700' 
                                  : 'text-gray-400'
                              }
                              ${hasAppointments && !isSelected ? 'bg-blue-100 text-blue-700' : ''}
                            `}
                          >
                            {format(day, 'd')}
                            {hasAppointments && (
                              <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Quick Actions - Enhanced */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                    <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                            <Plus className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-800">Book Appointment</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-blue-600" />
                      </button>
                      
                      <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl hover:from-emerald-100 hover:to-emerald-200 transition-all duration-300 group">
                        <div className="flex items-center space-x-3">
                          <div className="bg-emerald-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                            <Video className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-800">Video Consultation</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-emerald-600" />
                      </button>
                      
                      <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group">
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-800">Medical Records</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-purple-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Notifications - Enhanced */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">2</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                        <div className="bg-blue-600 p-2 rounded-lg">
                          <Bell className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            Appointment Reminder
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            You have an appointment tomorrow at 2:00 PM
                          </p>
                          <p className="text-xs text-blue-600 mt-1">2 hours ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                        <div className="bg-emerald-600 p-2 rounded-lg">
                          <MessageCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            New Message
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Dr. Smith sent you test results
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">5 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
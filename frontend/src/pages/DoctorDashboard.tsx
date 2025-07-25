import React, { useEffect, useState } from 'react';
import { Search, Bell, ChevronDown, TrendingUp, TrendingDown, Thermometer, Stethoscope, HeartPulse } from 'lucide-react';
import DoctorSidebar from '../components/Doctor/DoctorSidebar';
import { useAppSelector } from '../redux/hooks';
import { selectCurrentUser } from '../redux/selectors/userSelectors';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';

interface Patient {
  id: string;
  name: string;
  time: string;
  type: string;
  avatar: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface PatientDetail {
  name: string;
  age: string;
  duration: string;
  symptoms: string[];
  lastChecked: string;
  prescription: string;
  observation: string;
}

const DoctorDashboard: React.FC = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null);
  const [currentMonth] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayPatients: Patient[] = [
    {
      id: '1',
      name: 'Stacy Mitchell',
      time: '9:15 AM',
      type: 'Weekly Visit',
      avatar: 'SM',
      status: 'scheduled'
    },
    {
      id: '2',
      name: 'Amy Dunham',
      time: '9:30 AM',
      type: 'Routine Checkup',
      avatar: 'AD',
      status: 'scheduled'
    },
    {
      id: '3',
      name: 'Demi Joan',
      time: '9:50 AM',
      type: 'Report',
      avatar: 'DJ',
      status: 'scheduled'
    },
    {
      id: '4',
      name: 'Susan Myers',
      time: '10:15 AM',
      type: 'Weekly Visit',
      avatar: 'SM',
      status: 'scheduled'
    }
  ];

  const patientDetails: PatientDetail = {
    name: 'Denzel White',
    age: 'Male - 28 Years 5 Months',
    duration: '9 mins',
    symptoms: ['Fever', 'Cough', 'Heart Burn'],
    lastChecked: 'Dr Dally on 21 April 2020 (Prescription)',
    prescription: 'Dextromethorphan - 2 times a day\nIbuprofen - Day and Night before meal\nVitamin',
    observation: 'High fever and cough at normal hemoglobin levels.'
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[80px] bg-blue-600 text-white">
        <DoctorSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={currentUser?.profile?.fullName 
                    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.profile.fullName)}&background=3b82f6&color=fff`
                    : "https://ui-avatars.com/api/?name=Dr+Kim&background=3b82f6&color=fff"
                  }
                  alt="Doctor"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {currentUser?.profile?.fullName || 'Dr. Kim'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Welcome Section */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {getTimeBasedGreeting()} <span className="text-blue-600">
                  {currentUser?.profile?.fullName || 'Dr. Kim'}!
                </span>
              </h1>
            </div>

            {/* Stats Cards and Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Section - Stats and Patients */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Card */}
                <div className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute right-0 top-0 w-32 h-32 opacity-20">
                    <img 
                      src="/api/placeholder/128/128" 
                      alt="Doctor illustration"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="relative z-10">
                    <h2 className="text-lg font-medium mb-4">Visits for Today</h2>
                    <div className="text-4xl font-bold mb-6">104</div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm opacity-90">New Patients</span>
                          <TrendingUp className="w-4 h-4 text-green-300" />
                        </div>
                        <div className="text-2xl font-bold">40</div>
                        <div className="text-sm text-green-300">51% ↗</div>
                      </div>
                      
                      <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm opacity-90">Old Patients</span>
                          <TrendingDown className="w-4 h-4 text-red-300" />
                        </div>
                        <div className="text-2xl font-bold">64</div>
                        <div className="text-sm text-red-300">20% ↘</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Patient List</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Today</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {todayPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          onClick={() => setSelectedPatient(patientDetails)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-pink-600">
                                {patient.avatar}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-800">{patient.name}</h4>
                              <p className="text-xs text-gray-500">{patient.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-800">{patient.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Calendar and Patient Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Calendar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Calendar</h3>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth().map(day => {
                        const dayNumber = format(day, 'd');
                        const isCurrentDay = isToday(day);
                        
                        return (
                          <button
                            key={day.toISOString()}
                            className={`
                              w-8 h-8 text-sm rounded-lg transition-colors
                              ${isCurrentDay 
                                ? 'bg-red-500 text-white' 
                                : 'text-gray-700 hover:bg-gray-100'
                              }
                            `}
                          >
                            {dayNumber}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Upcoming section */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-800">Upcoming</h4>
                        <button className="text-xs text-blue-600 hover:underline">View All</button>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">M</span>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-800">Monthly doctor's meet</h5>
                          <p className="text-xs text-gray-500">8 April 2021 | 04:00 PM</p>
                        </div>
                        <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full">
                          Join Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Consultation Details */}
                {selectedPatient && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800">Consultation</h3>
                    </div>
                    
                    <div className="p-4">
                      {/* Patient Info */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">DW</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800">{selectedPatient.name}</h4>
                          <p className="text-xs text-gray-500">{selectedPatient.age}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-xs text-gray-500">{selectedPatient.duration}</p>
                        </div>
                      </div>

                      {/* Symptoms */}
                      <div className="flex items-center space-x-2 mb-4">
                        {selectedPatient.symptoms.map((symptom, symptomIndex) => (
                          <div key={symptomIndex} className="flex items-center space-x-1">
                            {symptom === 'Fever' && <Thermometer className="w-4 h-4 text-blue-500" />}
                            {symptom === 'Cough' && <Stethoscope className="w-4 h-4 text-blue-500" />}
                            {symptom === 'Heart Burn' && <HeartPulse className="w-4 h-4 text-blue-500" />}
                            <span className="text-xs text-blue-600">{symptom}</span>
                          </div>
                        ))}
                      </div>

                      {/* Details */}
                      <div className="space-y-3 text-xs">
                        <div>
                          <p className="text-gray-600 mb-1">Last Checked</p>
                          <p className="text-gray-800">{selectedPatient.lastChecked}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600 mb-1">Observation</p>
                          <p className="text-gray-800">{selectedPatient.observation}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600 mb-1">Prescription</p>
                          <p className="text-gray-800 whitespace-pre-line">{selectedPatient.prescription}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
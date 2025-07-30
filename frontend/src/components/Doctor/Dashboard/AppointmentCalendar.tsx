import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Video, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { useAppDispatch } from '../../../redux/hooks';
import { createVideoRoom, getVideoRoomToken } from '../../../redux/actions/dashboardActions';
import { toast } from 'react-toastify';

interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  scheduledFor: string;
  reason: string;
  status: string;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ appointments }) => {
  const dispatch = useAppDispatch();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => {
      const appointmentDate = format(new Date(apt.scheduledFor), 'yyyy-MM-dd');
      return appointmentDate === dateString;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleJoinVideoCall = async (appointmentId: string) => {
    try {
      // Try existing room first
      try {
        const tokenResponse = await dispatch(getVideoRoomToken(appointmentId)).unwrap();
        if (tokenResponse.token) {
          window.open(tokenResponse.joinUrl || tokenResponse.roomUrl, '_blank');
          return;
        }
      } catch {
        console.log('No existing room, creating new one...');
      }

      const roomResponse = await dispatch(createVideoRoom({
        appointmentId,
        expiresInMinutes: 60
      })).unwrap();

      if (roomResponse.joinUrl || roomResponse.roomUrl) {
        window.open(roomResponse.joinUrl || roomResponse.roomUrl, '_blank');
        toast.success('Video call started successfully');
      } else {
        toast.error('Unable to start video call');
      }
    } catch (error: unknown) {
      console.error('Video call error:', error);
      if (error instanceof Error) {
        toast.error(`Failed to start video call: ${error.message}`);
      } else {
        toast.error('Failed to start video call due to unknown error');
      }
    }
  };

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Calendar</h3>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h4 className="text-lg font-semibold text-gray-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h4>
          <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth().map(day => {
            const isCurrentDay = isToday(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const dayAppointments = getAppointmentsForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative w-9 h-9 text-sm rounded-lg transition-colors flex items-center justify-center
                  ${isCurrentDay
                    ? 'bg-blue-600 text-white font-semibold'
                    : isSelected
                    ? 'bg-blue-100 text-blue-600'
                    : isCurrentMonth
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-300'
                  }
                `}
              >
                {format(day, 'd')}
                {dayAppointments.length > 0 && (
                  <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                    isCurrentDay ? 'bg-white' : 'bg-blue-500'
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h4>

            {selectedDateAppointments.length === 0 ? (
              <p className="text-sm text-gray-500">No appointments scheduled</p>
            ) : (
              <div className="space-y-3">
                {selectedDateAppointments.map((appointment) => {
                  const appointmentTime = new Date(appointment.scheduledFor);
                  const isUpcoming = appointmentTime > new Date();

                  return (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {appointment.patientName || `Patient ${appointment.patientId}`}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">{appointment.reason}</p>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>

                        {appointment.status === 'scheduled' && isUpcoming && (
                          <button
                            onClick={() => handleJoinVideoCall(appointment.id)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-1"
                            title="Join Video Call"
                          >
                            <Video className="w-3 h-3" />
                            <span>Join</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Today's appointments:</span>
            <span className="font-semibold text-gray-800">
              {getAppointmentsForDate(new Date()).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;

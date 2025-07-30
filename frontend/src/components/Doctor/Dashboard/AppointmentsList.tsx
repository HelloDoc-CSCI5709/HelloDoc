import React from 'react';
import { ChevronDown, Clock, Video, Calendar, User } from 'lucide-react';
import { cancelAppointment, createVideoRoom, getVideoRoomToken } from '../../../redux/actions/dashboardActions';
import { useAppDispatch } from '../../../redux/hooks';
import { toast } from 'react-toastify';

interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  scheduledFor: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  doctorId: string;
}

interface AppointmentsListProps {
  appointments: Appointment[];
  onPatientSelect?: (patientId: string) => void;
  loading: boolean;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments, onPatientSelect, loading }) => {
  const dispatch = useAppDispatch();

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await dispatch(cancelAppointment(appointmentId)).unwrap();
        toast.success('Appointment cancelled successfully');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to cancel appointment: ${message}`);
      }
    }
  };

  const handleJoinVideoCall = async (appointmentId: string) => {
    try {
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to start video call: ${message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString();
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    const appointmentDate = new Date(dateString).toISOString().split('T')[0];
    return today === appointmentDate;
  };

  const isUpcoming = (dateString: string) => {
    const now = new Date();
    const appointmentTime = new Date(dateString);
    return appointmentTime > now;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Appointments</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse flex items-center space-x-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Appointments</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="p-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No appointments found</p>
            <p className="text-sm">Your schedule is clear!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments
              .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">
                        {appointment.patientName || `Patient ${appointment.patientId}`}
                      </h4>
                      <p className="text-xs text-gray-500">{appointment.reason}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.replace('_', ' ')}
                        </span>
                        {isToday(appointment.scheduledFor) && (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Today
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-800">
                        {formatTime(appointment.scheduledFor)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {formatDate(appointment.scheduledFor)}
                    </p>

                    <div className="flex space-x-2">
                      {appointment.status === 'scheduled' && isUpcoming(appointment.scheduledFor) && (
                        <>
                          <button
                            onClick={() => handleJoinVideoCall(appointment.id)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-1"
                            title="Join Video Call"
                          >
                            <Video className="w-3 h-3" />
                            <span>Join</span>
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            title="Cancel Appointment"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {onPatientSelect && (
                        <button
                          onClick={() => onPatientSelect(appointment.patientId)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          title="View Patient Details"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsList;

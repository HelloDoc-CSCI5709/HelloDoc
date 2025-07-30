import React, { useEffect } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getPatientAppointments } from '../../redux/actions/healthRecordActions';

interface AppointmentTabProps {
  patient: any;
}

const AppointmentTab: React.FC<AppointmentTabProps> = ({ patient }) => {
  const dispatch = useAppDispatch();
  const { appointments, loading } = useAppSelector(state => state.healthRecord);

  useEffect(() => {
    if (patient?.id) {
      dispatch(getPatientAppointments(patient.id));
    }
  }, [dispatch, patient?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sortedAppointments = appointments
    .slice()
    .sort((a: any, b: any) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Appointment History</h3>
        <div className="text-sm text-gray-600">
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading appointments...</span>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Found</h4>
          <p className="text-gray-600">
            No appointments found for {patient.fullName}. Schedule the first appointment to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Appointment Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Total</p>
                  <p className="text-xl font-bold text-blue-900">{appointments.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Completed</p>
                  <p className="text-xl font-bold text-green-900">
                    {appointments.filter((apt: any) => apt.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-600">Scheduled</p>
                  <p className="text-xl font-bold text-yellow-900">
                    {appointments.filter((apt: any) => apt.status === 'scheduled').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-red-600" />
                <div>
                  <p className="text-sm text-red-600">Cancelled</p>
                  <p className="text-xl font-bold text-red-900">
                    {appointments.filter((apt: any) => apt.status === 'cancelled').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments Timeline */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Chronological History</h4>
            </div>
            <div className="divide-y divide-gray-200">
              {sortedAppointments.map((appointment: any, index: number) => (
                <div key={appointment._id} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        appointment.status === 'completed' ? 'bg-green-500' :
                        appointment.status === 'scheduled' ? 'bg-blue-500' :
                        appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      {index < sortedAppointments.length - 1 && (
                        <div className="w-px h-16 bg-gray-300 mt-2" />
                      )}
                    </div>

                    {/* Appointment content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h5 className="text-lg font-medium text-gray-900">
                            Appointment #{appointment._id.slice(-6)}
                          </h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(appointment.scheduledFor).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(appointment.scheduledFor).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>
                            Dr. {appointment.doctorId?.fullName || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      {appointment.reason && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Reason:</span> {appointment.reason}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-3">
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentTab;

import React from "react";
import type { AppointmentType } from "./types";

type Props = {
  appointments: AppointmentType[];
  active: AppointmentType | null;
  onSelect: (a: AppointmentType) => void;
  userId: string;
};

const AppointmentList: React.FC<Props> = ({ appointments, active, onSelect, userId }) => {
  const getAppointmentStatus = (scheduledFor: string) => {
    const appointmentTime = new Date(scheduledFor).getTime();
    const now = Date.now();
    const timeDiff = appointmentTime - now;
    
    if (timeDiff > 0) {
      if (timeDiff < 60 * 60 * 1000) { // Less than 1 hour
        return { status: 'upcoming', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Starting Soon' };
      }
      return { status: 'scheduled', color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Scheduled' };
    } else {
      return { status: 'ended', color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Ended' };
    }
  };

  const formatTimeRemaining = (scheduledFor: string) => {
    const appointmentTime = new Date(scheduledFor).getTime();
    const now = Date.now();
    const timeDiff = appointmentTime - now;
    
    if (timeDiff <= 0) return null;
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    }
    return `in ${minutes}m`;
  };

  return (
    <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
            <p className="text-sm text-gray-500 mt-1">
              {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}
            </p>
          </div>
          <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-full"></div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="p-4 space-y-3">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v1a2 2 0 11-4 0v-1m4-4H8m10 0v6a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2h8a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No appointments yet</p>
            <p className="text-gray-400 text-sm mt-1">Your scheduled appointments will appear here</p>
          </div>
        ) : (
          [...appointments]
  .sort((a, b) => {
    const timeA = new Date(a.scheduledFor).getTime();
    const timeB = new Date(b.scheduledFor).getTime();

    const now = Date.now();
    const aEnded = timeA < now;
    const bEnded = timeB < now;

    // If both are upcoming or both ended, sort descending (latest first)
    if (aEnded === bEnded) return timeB - timeA;

    // Otherwise, push ended ones to bottom
    return aEnded ? 1 : -1;
  })
  .map((appt) => {

            const otherParty =
              appt.doctorId._id === userId ? appt.patientId.fullName : appt.doctorId.fullName;
            const statusInfo = getAppointmentStatus(appt.scheduledFor);
            const timeRemaining = formatTimeRemaining(appt.scheduledFor);
            const isActive = active?._id === appt._id;

            return (
              <div
                key={appt._id}
                onClick={() => onSelect(appt)}
                className={`cursor-pointer rounded-xl p-4 transition-all duration-200 border-2 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 shadow-md transform scale-[1.02]"
                    : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                {/* Header with name and status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {otherParty.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Name */}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{otherParty}</p>
                      <p className="text-xs text-gray-500">
                        {appt.doctorId._id === userId ? 'Patient' : 'Doctor'}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Date and Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v1a2 2 0 11-4 0v-1m4-4H8m10 0v6a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2h8a2 2 0 012 2z" />
                    </svg>
                    <span>
                      {new Date(appt.scheduledFor).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {new Date(appt.scheduledFor).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Time remaining (if applicable) */}
                {timeRemaining && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-yellow-700 font-medium">
                        Starting {timeRemaining}
                      </span>
                    </div>
                  </div>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-2 top-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-lg"></div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer with summary */}
      {appointments.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {appointments.filter(a => new Date(a.scheduledFor).getTime() > Date.now()).length} upcoming
            </span>
            <span>
              {appointments.filter(a => new Date(a.scheduledFor).getTime() <= Date.now()).length} completed
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
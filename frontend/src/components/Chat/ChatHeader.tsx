import React from 'react';
import type { AppointmentType } from './types';

type Props = {
  appointment: AppointmentType | null;
  userId: string;
};

const ChatHeader: React.FC<Props> = ({ appointment, userId }) => {
  if (!appointment) return <div className="p-4 border-b bg-white">Select an appointment</div>;

  const otherParty =
    appointment.doctorId._id === userId ? appointment.patientId.fullName : appointment.doctorId.fullName;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-400 shadow-lg" />
        <div>
          <h2 className="font-semibold text-gray-800">{otherParty}</h2>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {new Date(appointment.scheduledFor).toLocaleDateString()} -{' '}
        {new Date(appointment.scheduledFor).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
};

export default ChatHeader;

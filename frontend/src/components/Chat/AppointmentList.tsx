import React from "react";
import type { AppointmentType } from "./types";

type Props = {
  appointments: AppointmentType[];
  active: AppointmentType | null;
  onSelect: (a: AppointmentType) => void;
  userId: string;
};

const AppointmentList: React.FC<Props> = ({ appointments, active, onSelect, userId }) => {
  return (
    <div className="w-1/3 border-r overflow-y-auto bg-white">
      <h2 className="text-lg font-semibold p-4">Your Appointments</h2>
      {appointments.map((appt) => {
        const otherParty =
          appt.doctorId._id === userId ? appt.patientId.fullName : appt.doctorId.fullName;
        return (
          <div
            key={appt._id}
            onClick={() => onSelect(appt)}
            className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${
              active?._id === appt._id ? "bg-gray-200" : ""
            }`}
          >
            <p className="font-medium">{otherParty}</p>
            <p className="text-sm text-gray-500">
              {new Date(appt.scheduledFor).toLocaleDateString()} -{" "}
              {new Date(appt.scheduledFor).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AppointmentList;

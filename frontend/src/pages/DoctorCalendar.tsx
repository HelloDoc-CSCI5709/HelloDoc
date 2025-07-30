import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventClickArg } from "@fullcalendar/core";
import axios from "axios";

import TopNavbar from "../components/Doctor/TopNavbar";
import DoctorSidebar from "../components/Doctor/DoctorSidebar";


const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

interface Appointment {
  _id: string;
  scheduledFor: string;
  reason: string;
  patientId: {
    _id: string;
    fullName: string;
  };
  doctorId: {
    _id: string;
    fullName: string;
  };
}

const DoctorCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorId, setDoctorId] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        // Decode token to get doctor ID
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const loggedInDoctorId =
          decoded.id || decoded._id || decoded.userId || decoded.user?.id || "";

        setDoctorId(loggedInDoctorId);

        const res = await axios.get(`${BASE_URL}/api/appointments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAppointments(res.data.body || []);
      } catch (err) {
        console.error("Failed to fetch doctor appointments", err);
      }
    };

    fetchAppointments();
  }, []);

  const doctorAppointments = appointments.filter(
    (appt) => appt.doctorId?._id === doctorId
  );

  const events = doctorAppointments.map((appt) => ({
    id: appt._id,
    title: `Appt with ${appt.patientId.fullName}`,
    start: appt.scheduledFor,
    color: "#3b82f6",
    extendedProps: {
      patientName: appt.patientId.fullName,
      appointmentType: appt.reason,
      joinLink: `/video/${appt._id}`,
    },
  }));

  const handleEventClick = (info: EventClickArg) => {
    const link = info.event.extendedProps.joinLink;
    if (link) window.location.href = link;
  };

  const handleDateClick = (info: DateClickArg) => {
    const confirmed = window.confirm(
      `Do you want to block this time slot on ${info.dateStr}?`
    );
    if (confirmed) {
      console.log(`Blocking time slot: ${info.dateStr}`);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[80px] bg-blue-600 text-white">
        <DoctorSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top Navbar */}
        <div className="w-full border-b shadow-sm">
          <TopNavbar />
        </div>

        {/* Calendar Content */}
        <div className="p-6 overflow-y-auto min-h-[600px]">
          <div className="bg-white rounded-xl shadow-sm p-4 min-h-[500px]">
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
              initialView="timeGridWeek"
              events={events}
              eventClick={handleEventClick}


              
              dateClick={handleDateClick}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "timeGridDay,timeGridWeek,dayGridMonth",
              }}
              height="auto"
              dayMaxEvents={true}
              eventContent={(arg) => {
                const { patientName, appointmentType, joinLink } = arg.event.extendedProps;
                return (
                  <div className="cursor-pointer">
                    <div className="text-white text-sm font-medium px-2">
                      {patientName}
                    </div>
                    <div className="text-white text-xs px-2 opacity-90">
                      {appointmentType}
                    </div>
                    <button
                      className="mt-1 text-xs px-2 py-0.5 rounded bg-black text-white shadow hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = joinLink;
                      }}
                    >
                      Join Now
                    </button>
                  </div>
                );
              }}
              dayCellDidMount={(info) => {
                info.el.style.cursor = "pointer";
              }}
              slotLaneClassNames="cursor-pointer"
              slotLabelClassNames="cursor-pointer"
              dayHeaderClassNames="cursor-pointer"
              eventClassNames={() => "cursor-pointer"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCalendar;

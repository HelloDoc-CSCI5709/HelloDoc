import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventClickArg } from "@fullcalendar/core";
import axios from "axios";


import TopNavbar from "../components/Patient/TopNavbar";
import LeftSidebar from "../components/Patient/LeftSidebar";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

interface Appointment {
  _id: string;
  scheduledFor: string;
  doctorId: {
    fullName?: string;
    _id: string;
  };
}

const PatientCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await axios.get(`${BASE_URL}/api/appointments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAppointments(res.data.body || []);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
      }
    };

    fetchAppointments();
  }, []);

  const events = appointments.map((appt) => ({
    id: appt._id,
    title: `Appointment with ${appt.doctorId?.fullName || "Doctor"}`,
    start: appt.scheduledFor,
    color: "#3b82f6",
    extendedProps: {
      joinLink: `/video/${appt._id}`,
      doctorName: appt.doctorId?.fullName || "Doctor",
    },
  }));

  const handleEventClick = (info: EventClickArg) => {
    const link = info.event.extendedProps.joinLink;
    if (link) {
      window.location.href = link;
    }
  };

  const handleDateClick = (info: DateClickArg) => {
    const confirmed = window.confirm(
      `Do you want to book an appointment on ${info.dateStr}?`
    );
    if (confirmed) {
      window.location.href = `/book-appointment?date=${info.dateStr}`;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[80px] bg-blue-600 text-white">
        <LeftSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top Navbar */}
        <div className="w-full border-b shadow-sm">
          <TopNavbar />
        </div>

        {/* Calendar Content */}
        <div className="p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm p-4 min-h-[600px]">
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
              eventContent={(arg) => (
                <div className="cursor-pointer">
                  <div className="text-white text-sm font-medium px-2">
                    {arg.event.title}
                  </div>
                  <button
                    className="mt-1 text-xs px-2 py-0.5 rounded bg-black text-white shadow hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent full event click
                      const link = arg.event.extendedProps.joinLink;
                      if (link) window.location.href = link;
                    }}
                  >
                    Join Now
                  </button>
                </div>
              )}
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

export default PatientCalendar;

import React from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventClickArg, DateClickArg } from "@fullcalendar/core";

import TopNavbar from "../components/Patient/TopNavbar";
import LeftSidebar from "../components/Patient/LeftSidebar";

const PatientCalendar: React.FC = () => {
  const events = [
    {
      id: "1",
      title: "Dr. Kim Appointment",
      start: "2025-07-25T08:00:00",
      color: "#f43f5e",
      extendedProps: {
        joinLink: "/join/1",
      },
    },
    {
      id: "2",
      title: "Dr. Stacy Appointment",
      start: "2025-07-26T09:30:00",
      color: "#10b981",
      extendedProps: {
        joinLink: "/join/2",
      },
    },
  ];

  const handleEventClick = (info: EventClickArg) => {
    const link = info.event.extendedProps.joinLink;
    if (link) window.location.href = link;
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
          <div className="bg-white rounded-xl shadow-sm p-4">
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
                  <button className="mt-1 text-xs px-2 py-0.5 rounded bg-black text-white shadow hover:scale-105">
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
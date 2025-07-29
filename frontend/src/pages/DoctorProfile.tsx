import React, { useState } from "react";
import TopNavBar from "../components/Patient/TopNavbar";
import SideBar from "../components/Patient/LeftSidebar";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import axios from "axios";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../constant_url";

const DoctorProfile: React.FC = () => {
  const navigate = useNavigate();
  const doctor = JSON.parse(localStorage.getItem("selectedDoctor") || "{}");

  const [selectedTime, setSelectedTime] = useState("12:30 PM");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "12:00 PM", "12:30 PM",
  ];

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a valid date and time");
      return;
    }

    const reason = localStorage.getItem("appointmentReason");
    const token = localStorage.getItem("accessToken");

    if (!reason) {
      toast.error("Missing reason for appointment");
      return;
    }

    if (!token) {
      toast.error("Not logged in");
      return;
    }

    try {
      const [time, modifier] = selectedTime.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const combinedDateTime = new Date(selectedDate);
      combinedDateTime.setHours(hours, minutes, 0, 0);

      const payload = {
        doctorId: doctor.doctorId,
        scheduledFor: combinedDateTime.toISOString(),
        reason,
      };

      await axios.post(`${BASE_URL}/api/appointments/book`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Appointment booked successfully!");
      navigate("/patient-calendar");
    } catch (err) {
      if (axios.isAxiosError(err)) {
  console.error("Booking failed:", err.response?.data || err.message);

  const serverMessage = err.response?.data?.message || "";

  let userMessage = "Booking failed";

  if (serverMessage.includes("already booked")) {
    userMessage = "Booking failed: This slot is not available";
  } else if (serverMessage.includes("Scheduled date must be in the future")) {
    userMessage = "Booking failed: Please select a future date";
  } else if (serverMessage.includes("Only patients can book")) {
    userMessage = "Booking failed: Unauthorized action";
  } else if (serverMessage.includes("Validation error")) {
    userMessage = "Booking failed: Please complete all required fields";
  }

  toast.error(userMessage);
} else {
  console.error("Unexpected error:", err);
  toast.error("Unexpected error while booking appointment");
}

    }
  };

  if (!doctor?.name) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="w-[80px] bg-blue-600 text-white">
          <SideBar />
        </div>
        <div className="flex-1 flex flex-col bg-white">
          <div className="w-full border-b shadow-sm">
            <TopNavBar />
          </div>
          <main className="flex-1 flex items-center justify-center p-6 text-gray-600">
            <div className="text-center">
              <h2 className="text-xl mb-2">No doctor selected.</h2>
              <p className="text-sm">Please go back and select a doctor from the list.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-[80px] bg-blue-600 text-white">
        <SideBar />
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="w-full border-b shadow-sm bg-white">
          <TopNavBar />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Doctor Info */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
              <div className="flex items-start gap-6">
                <img
                  src={doctor.image}
                  alt="Doctor Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block mb-2">
                    {doctor.specialty}
                  </div>
                  <p className="text-gray-600">{doctor.clinic}</p>
                  <p className="text-gray-600">{doctor.experience}</p>
                </div>
              </div>
            </div>

            {/* Schedule Form */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Schedule Appointment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-2">Select Date</label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    minDate={new Date()}
                    className="w-full px-4 py-3 border rounded-md border-gray-300"
                    dateFormat="dd/MM/yyyy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Available Time</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-4 rounded-md border font-medium text-sm ${
                          selectedTime === slot
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <div className="text-center mt-6">
              <button
                onClick={handleBookAppointment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorProfile;

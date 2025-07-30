import React, { useEffect, useState } from "react";
import { decodeToken } from "../utils/decodeToken";
import PatientSidebar from "../components/Patient/LeftSidebar";
import DoctorSidebar from "../components/Doctor/DoctorSidebar";
import PatientTopNavBar from "../components/Patient/TopNavbar";
import DoctorTopNavBar from "../components/Doctor/TopNavbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Appointment {
  _id: string;
  patientId: { _id: string; fullName: string; email: string };
  doctorId: { _id: string; fullName: string; email: string };
  scheduledFor: string;
  reason: string;
  status: string;
  date: string;
  time: string;
}

const AllAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const token = localStorage.getItem("accessToken");
  const decoded = decodeToken(token);
  const role = decoded?.role;

  const Sidebar = role === "doctor" ? DoctorSidebar : PatientSidebar;
  const TopNavBar = role === "doctor" ? DoctorTopNavBar : PatientTopNavBar;

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch appointments");
      setAppointments(data.body);
    } catch (err) {
  const errorMsg = err instanceof Error ? err.message : "Unknown error";
  toast.error(errorMsg || "Error message");
} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAppointments();
  }, [token]);

  const handleCancel = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirm) return;

    setCancellingId(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/appointments/cancel/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Appointment cancelled successfully");
      fetchAppointments();
    } catch (err) {
  const errorMsg = err instanceof Error ? err.message : "Unknown error";
  toast.error(errorMsg || "Error message");
}finally {
      setCancellingId(null);
    }
  };

  const openRescheduleModal = (id: string, reason: string) => {
    setSelectedAppointmentId(id);
    setRescheduleReason(reason);
    setRescheduleDate(new Date());
    setShowRescheduleModal(true);
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !selectedAppointmentId) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/appointments/reschedule/${selectedAppointmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            scheduledFor: rescheduleDate.toISOString(),
            reason: rescheduleReason,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Appointment rescheduled successfully");
      setShowRescheduleModal(false);
      fetchAppointments();
    } catch (err) {
  const errorMsg = err instanceof Error ? err.message : "Unknown error";
  toast.error(errorMsg || "Error message");
}
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!token || !decoded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unauthorized Access</h3>
          <p className="text-gray-600">Please log in to view your appointments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="w-[80px] bg-blue-600 text-white">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="w-full border-b bg-white shadow-sm">
          <TopNavBar />
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
              <p className="text-gray-600">Manage and track your upcoming appointments</p>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your appointments...</p>
                  </div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                  <p className="text-gray-600">Your appointments will appear here once scheduled.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {appointments.map((appt) => (
                    <div key={appt._id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Left Section - Person Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                              {(role === "doctor" ? appt.patientId.fullName : appt.doctorId.fullName).charAt(0).toUpperCase()}
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {role === "doctor" ? appt.patientId.fullName : appt.doctorId.fullName}
                              </h3>
                              <p className="text-sm text-gray-600 truncate">
                                {role === "doctor" ? appt.patientId.email : appt.doctorId.email}
                              </p>
                              
                              {/* Reason */}
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-700">Reason: </span>
                                <span className="text-sm text-gray-600">{appt.reason}</span>
                              </div>
                              
                              {/* Status Badge */}
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appt.status)}`}>
                                  {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Date/Time & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
                          {/* Date & Time */}
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(appt.date)}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {appt.time}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => openRescheduleModal(appt._id, appt.reason)}
                              className="inline-flex items-center px-3 py-2 border border-amber-300 text-amber-700 bg-amber-50 text-sm font-medium rounded-lg hover:bg-amber-100 hover:border-amber-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancel(appt._id)}
                              disabled={cancellingId === appt._id}
                              className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 bg-red-50 text-sm font-medium rounded-lg hover:bg-red-100 hover:border-red-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancellingId === appt._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-1.5"></div>
                              ) : (
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Toast container */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="mt-16"
      />

      {/* Enhanced Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Reschedule Appointment</h3>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Date & Time
                </label>
                <DatePicker
                  selected={rescheduleDate}
                  onChange={(date: Date | null) => setRescheduleDate(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={new Date()}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholderText="Select date and time"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter reason for rescheduling"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!rescheduleDate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointments;
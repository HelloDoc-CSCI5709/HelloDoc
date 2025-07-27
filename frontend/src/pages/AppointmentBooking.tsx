import React, { useState, useEffect } from "react";
import { useDebounce } from "../hooks/useDebounce";

import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { bookAppointment } from "../redux/actions/appointmentActions";
import Sidebar from "../components/Patient/LeftSidebar";
import TopNavBar from "../components/Patient/TopNavbar";
import { usePlaceAutocomplete } from "../hooks/usePlaceAutocomplete";
import { toast } from "react-toastify";
import {
  selectAppointmentLoading,
  selectAppointmentError,
} from "../redux/selectors/appointmentSelectors";
import { selectCurrentUser } from "../redux/selectors/userSelectors";

interface AppointmentForm {
  doctorId: string;
  scheduledFor: string;
  reason: string;
  address: string;
  postalCode: string;
}

const AppointmentBooking: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAppointmentLoading);
  const error = useAppSelector(selectAppointmentError);
  const user = useAppSelector(selectCurrentUser);

  const [form, setForm] = useState<AppointmentForm>({
    doctorId: "",
    scheduledFor: "",
    reason: "",
    address: "",
    postalCode: "",
  });

  const debouncedAddress = useDebounce(form.address, 500);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setForm({
      doctorId: "",
      scheduledFor: "",
      reason: "",
      address: "",
      postalCode: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("You must be logged in to book an appointment");
      return;
    }

    if (
      !form.scheduledFor ||
      !form.reason ||
      !form.address ||
      !form.postalCode
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const appointmentData = {
        doctorId: form.doctorId,
        scheduledFor: new Date(form.scheduledFor).toISOString(),
        reason: form.reason,
        address: form.address,
        postalCode: form.postalCode,
      };

      const resultAction = await dispatch(bookAppointment(appointmentData));

      if (bookAppointment.fulfilled.match(resultAction)) {
        toast.success("Appointment booked successfully!");
        navigate("/appointments");
      }
    } catch (err) {
      console.error("Failed to book appointment:", err);
    }
  };

  usePlaceAutocomplete("autocomplete-address", (selectedAddress) => {
    setForm((prev) => ({ ...prev, address: selectedAddress }));
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-[80px] bg-blue-600 text-white">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <div className="w-full border-b shadow-sm">
          <TopNavBar />
        </div>

        <main className="flex-1 overflow-y-auto p-2 md:p-2">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Appointment Booking</h2>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">
                    Reason for Appointment*
                  </label>
                  <textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="Describe your symptoms or reason for visit"
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Postal Code*</label>
                  <select
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select your postal code</option>
                    <option value="H1A">H1A</option>
                    <option value="H1B">H1B</option>
                    <option value="H1C">H1C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Address*</label>
                  <input
                    id="autocomplete-address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Start typing your address..."
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">
                    Appointment Date & Time*
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledFor"
                    value={form.scheduledFor}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-6 py-2 border border-blue-400 text-blue-600 rounded hover:bg-blue-50 text-sm"
                    disabled={loading}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Booking..." : "Book Appointment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppointmentBooking;

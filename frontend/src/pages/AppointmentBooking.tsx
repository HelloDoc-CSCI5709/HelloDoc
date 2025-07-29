import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Patient/LeftSidebar";
import TopNavBar from "../components/Patient/TopNavbar";
import { usePlaceAutocomplete } from "../hooks/usePlaceAutocomplete";
import { toast } from "react-toastify";

interface AppointmentForm {
  reason: string;
  address: string;
}

const AppointmentBooking: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<AppointmentForm>({
    reason: "",
    address: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClear = () => {
    setForm({ reason: "", address: "" });
    localStorage.removeItem("appointmentReason");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.reason.trim()) {
      toast.error("Please provide a reason for the appointment");
      return;
    }

    try {
      localStorage.setItem("appointmentReason", form.reason.trim());
      console.log("✅ Reason saved to localStorage:", form.reason.trim());
      navigate("/select-doctor");
    } catch (e) {
      console.error("❌ Failed to save reason to localStorage", e);
      toast.error("Something went wrong. Please try again.");
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
                  <label className="block text-sm mb-1">Reason for Appointment*</label>
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
                  <label className="block text-sm mb-1">Address*</label>
                  <input
                    id="autocomplete-address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Start typing your address..."
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-6 py-2 border border-blue-400 text-blue-600 rounded hover:bg-blue-50 text-sm"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Continue
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

import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Doctor/DoctorSidebar";
import TopNavBar from "../components/Doctor/TopNavbar";
import { BASE_URL } from "../constant_url";
import { decodeToken } from "../utils/decodeToken";

interface DoctorProfile {
  fullName: string;
  gender: string;
  phone: string;
  education: string;
  specialization: string[];
  bio: string;
}

const DoctorSettingsPage: React.FC = () => {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [availability, setAvailability] = useState<{ start: string; end: string }[]>([]);
  const [credentialStatus, setCredentialStatus] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const token = localStorage.getItem("accessToken");
  const decoded = decodeToken(token);
  const doctorId = decoded?.userId;

  useEffect(() => {
    if (!token || !doctorId) return;

    const fetchDoctorProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/doctors/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctor(res.data.body.doctor);
      } catch {
        setDoctor(null);
      }
    };

    const fetchAvailability = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/doctors/availability`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailability(res.data.body.slots || []);
      } catch {
        setAvailability([]);
      }
    };

    const fetchCredentialStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/doctors/${doctorId}/credentials`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCredentialStatus(res.data.body.status || "Pending");
      } catch {
        setCredentialStatus(null);
      }
    };

    fetchDoctorProfile();
    fetchAvailability();
    fetchCredentialStatus();
  }, [token, doctorId]);

  const handleFileUpload = async () => {
    if (!selectedFile || !token || !doctorId) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post(`${BASE_URL}/api/doctors/${doctorId}/credentials`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Credential uploaded successfully.");
      setSelectedFile(null);
      const res = await axios.get(`${BASE_URL}/api/doctors/${doctorId}/credentials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCredentialStatus(res.data.body.status || "Pending");
    } catch {
      alert("Failed to upload credential.");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="w-[80px] bg-blue-600 text-white">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopNavBar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-gray-600">Manage your profile, availability, and credentials</p>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Doctor Profile</h2>
              </div>
              <div className="p-6">
                {doctor ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-800">{doctor.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium text-gray-800">{doctor.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">{doctor.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Education</p>
                      <p className="font-medium text-gray-800">{doctor.education}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Specialization</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {doctor.specialization.map((spec, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Bio</p>
                      <p className="text-gray-800 leading-relaxed">{doctor.bio}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Loading profile...</p>
                )}
              </div>
            </div>

            {/* Availability Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-10">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Monthly Availability</h2>
              </div>
              <div className="p-6 space-y-4">
                {availability.length > 0 ? (
                  availability.map((slot, idx) => (
                    <div key={idx} className="p-4 bg-gray-100 border rounded-lg shadow-sm">
                      <p className="text-gray-800 font-medium">
                        {new Date(slot.start).toLocaleString()} – {new Date(slot.end).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No availability slots found.</p>
                )}
              </div>
            </div>

            {/* Credential Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-10">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Credential Upload</h2>
              </div>
              <div className="p-6 space-y-4">
                {credentialStatus && (
                  <div>
                    <p className="text-sm text-gray-500">Current Status:</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(credentialStatus)}`}>
                      {credentialStatus}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Upload PDF Credential Document
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>

                <button
                  onClick={handleFileUpload}
                  disabled={credentialStatus === "Approved"}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Upload Credential
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorSettingsPage;

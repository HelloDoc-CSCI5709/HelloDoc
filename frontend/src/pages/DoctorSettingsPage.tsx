import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../components/Doctor/DoctorSidebar";
import TopNavBar from "../components/Doctor/TopNavbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../constant_url";

const DoctorSettingsPage: React.FC = () => {
  const [doctor, setDoctor] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [credentialStatus, setCredentialStatus] = useState<any>(null);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchDoctorProfile();
    fetchAvailability();
    fetchCredentialStatus();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/doctors/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctor(res.data.body.doctor);
    } catch (err) {
      toast.error("Failed to load doctor profile");
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/doctors/availability`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailability(res.data.body);
    } catch (err) {
      toast.error("Failed to load availability");
    }
  };

  const fetchCredentialStatus = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("user") || '{}').userId;
      const res = await axios.get(`${BASE_URL}/api/doctors/${userId}/credentials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCredentialStatus(res.data.body);
    } catch (err) {
      setCredentialStatus(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return toast.warning("Please select a PDF file");
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const userId = JSON.parse(localStorage.getItem("user") || '{}').userId;
      await axios.post(`${BASE_URL}/api/doctors/${userId}/credentials`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Credential submitted successfully");
      fetchCredentialStatus();
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="w-[80px] bg-blue-600 text-white">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <TopNavBar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-gray-600">Manage your profile, availability, and credentials</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Profile */}
              <div className="lg:col-span-2 space-y-8">
                {/* Profile Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Doctor Profile
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    {doctor ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Full Name</p>
                              <p className="text-gray-900 font-medium">{doctor.fullName}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Gender</p>
                              <p className="text-gray-900">{doctor.gender}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Phone</p>
                              <p className="text-gray-900">{doctor.phone}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Specialization</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {doctor.specialization?.map((spec: string, idx: number) => (
                                  <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Education</p>
                              <p className="text-gray-900">{doctor.education}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:col-span-2 mt-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Bio</p>
                              <p className="text-gray-900 leading-relaxed">{doctor.bio}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-500">Loading profile...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Monthly Availability Slots
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    {availability.length ? (
                      <div className="space-y-3">
                        {availability.map((slot, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {new Date(slot.start).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(slot.start).toLocaleTimeString()} - {new Date(slot.end).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Available
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No availability slots yet</p>
                        <p className="text-gray-400 text-sm">Set your available time slots to start receiving appointments</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Credentials */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Credentials
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    {credentialStatus ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${getStatusBadgeColor(credentialStatus.status)}`}>
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {credentialStatus.status}
                          </div>
                        </div>
                        
                        {credentialStatus.status === 'Rejected' && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start">
                              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <div>
                                <h4 className="text-sm font-medium text-red-800">Rejection Reason</h4>
                                <p className="text-sm text-red-700 mt-1">{credentialStatus.reason}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {credentialStatus.status === 'Approved' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-green-800">Credentials Verified</p>
                            <p className="text-xs text-green-600 mt-1">Your documents have been approved</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Credentials</h3>
                          <p className="text-sm text-gray-500 mb-6">Upload your medical license and certification documents</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select PDF Document
                            </label>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <button
                            onClick={handleFileUpload}
                            disabled={!selectedFile}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>Upload Credential</span>
                          </button>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <h4 className="text-sm font-medium text-blue-800">Important Note</h4>
                              <p className="text-sm text-blue-700 mt-1">Only PDF files are accepted. Ensure your documents are clear and readable.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorSettingsPage;
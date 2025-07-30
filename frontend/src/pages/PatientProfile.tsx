import React, { useEffect, useState } from 'react';
import TopNavBar from '../components/Patient/TopNavbar';
import LeftSidebar from '../components/Patient/LeftSidebar';
import PatientInfoSection from '../components/Patient/PatientInfoSection';
import PatientDocumentUpload from '../components/Patient/PatientDocumentUpload';
import axios from 'axios';
import { BASE_URL } from '../constant_url';
interface Patient {
  fullName: string;
  gender: string;
  dob: string;
  mobile: string;
  emergencyContact: string;
  email: string;
  image: string;
}


const PatientProfile: React.FC = () => {
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [patientDocuments, setPatientDocuments] = useState<{ [key: string]: string }>({});
  const token = localStorage.getItem('accessToken');

    useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/patient/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data?.body?.user || {};
        const profile = res.data?.body?.profile || {};
        const documents = res.data?.body?.documents?.patientDocuments || [];

        setPatientData({
          fullName: user.fullName || '',
          gender: profile.gender || '',
          dob: profile.dob ? profile.dob.slice(0, 10) : '',
          mobile: profile.mobile || '',
          emergencyContact: profile.emergencyContact || '',
          email: user.email || '',
          image: `https://ui-avatars.com/api/?name=${user.fullName || 'Patient'}`,
        });

        setPatientDocuments(documents);
      } catch (err) {
        console.error('Failed to fetch patient info', err);
      }
    };

    fetchPatientProfile();
  }, [token]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[80px] bg-blue-600 text-white">
        <LeftSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top Navbar */}
        <div className="w-full border-b shadow-sm bg-white">
          <TopNavBar />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <PatientInfoSection patient={patientData}/>
            <PatientDocumentUpload patient={patientData} documents={patientDocuments} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientProfile;
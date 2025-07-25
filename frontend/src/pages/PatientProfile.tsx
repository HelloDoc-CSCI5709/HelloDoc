import React from 'react';
import TopNavBar from '../components/Patient/TopNavbar';
import LeftSidebar from '../components/Patient/LeftSidebar';
import PatientInfoSection from '../components/Patient/PatientInfoSection';
import PatientDocumentUpload from '../components/Patient/PatientDocumentUpload';

const PatientProfile: React.FC = () => {
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
            <PatientInfoSection />
            <PatientDocumentUpload />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientProfile;

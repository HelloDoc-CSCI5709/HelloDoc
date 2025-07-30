import React, { useState } from 'react';
import DoctorSidebar from '../components/Doctor/DoctorSidebar';
import DoctorTopNavBar from '../components/Doctor/TopNavbar';
import BasicInfoSection from '../components/Doctor/Profile/BasicInfoSection';
import AvailabilitySection from '../components/Doctor/Profile/AvailabilitySection';
import CredentialSection from '../components/Doctor/Profile/CredentialSection';
import AddressSection from '../components/Doctor/Profile/AddressSection';

const DoctorProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'availability' | 'credentials' | 'address'>('basic');

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[80px] bg-blue-600 text-white">
        <DoctorSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top navigation */}
        <div className="h-16 w-full border-b shadow-sm bg-white">
          <DoctorTopNavBar />
        </div>

        {/* Profile content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
              <p className="text-gray-600 mt-2">Manage your professional information and settings</p>
            </div>
            
            {/* Tab Navigation */}
            <div className="mb-6">
              <nav className="flex space-x-8 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'basic'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Basic Information
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'availability'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Availability
                </button>
                <button
                  onClick={() => setActiveTab('credentials')}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'credentials'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Credentials
                </button>
                <button
                  onClick={() => setActiveTab('address')}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'address'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Address
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'basic' && <BasicInfoSection />}
            {activeTab === 'availability' && <AvailabilitySection />}
            {activeTab === 'credentials' && <CredentialSection />}
            {activeTab === 'address' && <AddressSection />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorProfilePage;

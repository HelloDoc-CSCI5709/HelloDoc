import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, User, Calendar, Download, MessageSquare } from 'lucide-react';
import DoctorSidebar from '../components/Doctor/DoctorSidebar';
import DoctorTopNavBar from '../components/Doctor/TopNavbar';
import PatientSelector from '../components/HealthRecord/PatientSelector';
import HealthRecordTabs from '../components/HealthRecord/HealthRecordTabs';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { getDoctorPatients } from '../redux/actions/healthRecordActions';
import { toast } from 'react-toastify';

const DoctorHealthRecord: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients, selectedPatient, loading, error } = useAppSelector(state => state.healthRecord);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getDoctorPatients());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const filteredPatients = patients.filter(patient =>
    patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[80px] bg-blue-600 text-white">
        <DoctorSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top Navigation */}
        <div className="h-16 w-full border-b shadow-sm bg-white">
          <DoctorTopNavBar />
        </div>

        {/* Health Record Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Records</h1>
              <p className="text-gray-600">Manage and review patient health records and medical documents</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Patient List Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Patients</h3>
                    
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <PatientSelector
                    patients={filteredPatients}
                    selectedPatient={selectedPatient}
                    loading={loading}
                  />
                </div>
              </div>

              {/* Health Records Content */}
              <div className="lg:col-span-3">
                {selectedPatient ? (
                  <HealthRecordTabs patient={selectedPatient} />
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Patient</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Choose a patient from the left sidebar to view their health records and medical documents.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Info */}
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">✅ Dynamic Data Active</h4>
              <p className="text-sm text-green-800">
                Now fetching real patient data from your backend APIs. Found {filteredPatients.length} patients.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorHealthRecord;

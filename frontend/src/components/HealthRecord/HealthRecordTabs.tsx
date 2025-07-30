import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Pill, ClipboardList } from 'lucide-react';
import OverviewTab from './OverviewTab';
import AppointmentTab from './AppointmentTab';
import MedicalRecordTab from './MedicalRecordTab';
import MedicationTab from './MedicationTab';
import { useAppSelector } from '../../redux/hooks';

interface HealthRecordTabsProps {
  patient: any;
}

type TabType = 'overview' | 'appointment' | 'medical' | 'medication';

const HealthRecordTabs: React.FC<HealthRecordTabsProps> = ({ patient }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { healthRecords, loading } = useAppSelector(state => state.healthRecord);

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: ClipboardList },
    { id: 'appointment' as TabType, label: 'Appointment History', icon: Calendar },
    { id: 'medical' as TabType, label: 'Medical Records', icon: FileText },
    { id: 'medication' as TabType, label: 'Medication', icon: Pill },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Patient Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {patient.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{patient.fullName}</h2>
            <p className="text-gray-600">{patient.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active Patient
              </span>
              <span className="text-sm text-gray-500">
                {Object.keys(healthRecords || {}).length} record{Object.keys(healthRecords || {}).length !== 1 ? 's' : ''} available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading health records...</span>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab patient={patient} records={healthRecords} />}
            {activeTab === 'appointment' && <AppointmentTab patient={patient} />}
            {activeTab === 'medical' && <MedicalRecordTab patient={patient} records={healthRecords} />}
            {activeTab === 'medication' && <MedicationTab patient={patient} />}
          </>
        )}
      </div>
    </div>
  );
};

export default HealthRecordTabs;

import React from 'react';
import { User, Calendar } from 'lucide-react';
import { useAppDispatch } from '../../redux/hooks';
import { getPatientHealthRecords } from '../../redux/actions/healthRecordActions';
import { setSelectedPatient } from '../../redux/reducers/healthRecordReducer';

interface PatientSelectorProps {
  patients: any[];
  selectedPatient: any | null;
  loading: boolean;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({ patients, selectedPatient, loading }) => {
  const dispatch = useAppDispatch();

  const handlePatientSelect = (patient: any) => {
    dispatch(setSelectedPatient(patient));
    dispatch(getPatientHealthRecords(patient._id));
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {patients.length === 0 ? (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No patients found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map((patient) => (
            <div
              key={patient._id}
              onClick={() => handlePatientSelect(patient)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedPatient?.id === patient._id
                  ? 'bg-blue-50 border-blue-200 border-2'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {patient.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {patient.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {patient.email}
                  </p>
                  {patient.lastAppointment && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Last: {new Date(patient.lastAppointment).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientSelector;

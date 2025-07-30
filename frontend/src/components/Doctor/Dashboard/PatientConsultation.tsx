import React from 'react';
import { Clock, Calendar, FileText, Pill } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  medicalHistory?: string[];
  currentAppointment?: {
    time: string;
    type: string;
    reason: string;
  };
  vitals?: {
    bloodPressure: string;
    temperature: string;
    heartRate: string;
    weight: string;
  };
  medications?: string[];
  lastVisit?: string;
}

interface PatientConsultationProps {
  patient: Patient;
}

const PatientConsultation: React.FC<PatientConsultationProps> = ({ patient }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Patient Consultation</h3>
      </div>
      
      <div className="p-4">
        {/* Patient Info */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-800">{patient.name}</h4>
            <p className="text-sm text-gray-600">{patient.gender} • {patient.age} years old</p>
            {patient.currentAppointment && (
              <div className="flex items-center space-x-1 mt-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-600">
                  {new Date(patient.currentAppointment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-6">
          <h5 className="text-sm font-semibold text-gray-800 mb-2">Contact Information</h5>
          <div className="space-y-1 text-sm text-gray-600">
            <p>📞 {patient.phone}</p>
            <p>📧 {patient.email}</p>
          </div>
        </div>

        {/* Current Visit */}
        {patient.currentAppointment && (
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-800 mb-2">Current Visit</h5>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800 mb-1">{patient.currentAppointment.type}</p>
              <p className="text-sm text-blue-600">{patient.currentAppointment.reason}</p>
            </div>
          </div>
        )}

        {/* Vitals */}
        {patient.vitals && (
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-800 mb-2">Recent Vitals</h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Blood Pressure</p>
                <p className="text-sm font-semibold text-gray-800">{patient.vitals.bloodPressure}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Temperature</p>
                <p className="text-sm font-semibold text-gray-800">{patient.vitals.temperature}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Heart Rate</p>
                <p className="text-sm font-semibold text-gray-800">{patient.vitals.heartRate}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Weight</p>
                <p className="text-sm font-semibold text-gray-800">{patient.vitals.weight}</p>
              </div>
            </div>
          </div>
        )}

        {/* Medical History */}
        {patient.medicalHistory && patient.medicalHistory.length > 0 && (
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-800 mb-2">Medical History</h5>
            <div className="space-y-2">
              {patient.medicalHistory.map((condition, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{condition}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Medications */}
        {patient.medications && patient.medications.length > 0 && (
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-800 mb-2">Current Medications</h5>
            <div className="space-y-2">
              {patient.medications.map((medication, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Pill className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">{medication}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Visit */}
        {patient.lastVisit && (
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-800 mb-2">Last Visit</h5>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(patient.lastVisit).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-100">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Start Consultation
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            View Full Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientConsultation;

import React, { useState, type JSX } from 'react';
import { Phone, Edit3, Save, X, User, AlertTriangle, HeartPulse, FileText, PhoneCall } from 'lucide-react';

interface Patient {
  name: string;
  gender: string;
  age: number;
  phone: string;
  image: string;
  dob: string;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
  medicalNote: string;
}

const PatientInfoSection: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [patient, setPatient] = useState<Patient>({
    name: 'Alan Levis',
    gender: 'Male',
    age: 32,
    phone: '+880 17252412323',
    image: 'https://ui-avatars.com/api/?name=Alan',
    dob: '2000-01-01',
    bloodType: 'B+',
    allergies: 'Pollen',
    emergencyContact: '9999999999',
    medicalNote: 'Diabetic',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully.');
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-blue-100 p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Patient Information</h3>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
        {/* Patient Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img
              src={patient.image}
              alt="Patient"
              className="w-16 h-16 rounded-full object-cover shadow-sm"
            />
            <div>
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    name="name"
                    value={patient.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-blue-50 text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all"
                    placeholder="Full Name"
                  />
                  <div className="flex gap-3">
                    <select
                      name="gender"
                      value={patient.gender}
                      onChange={handleChange}
                      className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl bg-blue-50 text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      name="age"
                      type="number"
                      value={patient.age}
                      onChange={handleChange}
                      className="w-20 px-4 py-3 border-2 border-blue-200 rounded-xl bg-blue-50 text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all"
                      placeholder="Age"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-gray-800 font-semibold text-lg">{patient.name}</h2>
                  <p className="text-gray-500 text-sm">{patient.gender} • {patient.age} years old</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-2 rounded text-sm transition-all ${
              isEditing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                : 'px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50'
            }`}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4 inline-block mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 inline-block mr-2" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid gap-3">
          <InfoRow 
            icon={<Phone className="w-5 h-5" />} 
            label="Contact Number" 
            isEditing={isEditing} 
            name="phone" 
            value={patient.phone} 
            onChange={handleChange} 
          />
          <InfoRow 
            icon={<User className="w-5 h-5" />} 
            label="Date of Birth" 
            isEditing={isEditing} 
            name="dob" 
            value={patient.dob} 
            onChange={handleChange} 
            type="date" 
          />
          <InfoRow 
            icon={<HeartPulse className="w-5 h-5" />} 
            label="Blood Type" 
            isEditing={isEditing} 
            name="bloodType" 
            value={patient.bloodType} 
            onChange={handleChange} 
          />
          <InfoRow 
            icon={<AlertTriangle className="w-5 h-5" />} 
            label="Allergies" 
            isEditing={isEditing} 
            name="allergies" 
            value={patient.allergies} 
            onChange={handleChange} 
          />
          <InfoRow 
            icon={<PhoneCall className="w-5 h-5" />} 
            label="Emergency Contact" 
            isEditing={isEditing} 
            name="emergencyContact" 
            value={patient.emergencyContact} 
            onChange={handleChange} 
          />
          <InfoRow 
            icon={<FileText className="w-5 h-5" />} 
            label="Medical Notes" 
            isEditing={isEditing} 
            name="medicalNote" 
            value={patient.medicalNote} 
            onChange={handleChange} 
          />
        </div>

        {isEditing && (
          <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4 inline-block mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({
  icon,
  label,
  isEditing,
  name,
  value,
  onChange,
  type = 'text',
}: {
  icon: JSX.Element;
  label: string;
  isEditing: boolean;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) => (
  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
    <div className="flex items-center gap-3">
      <div className="text-blue-600">{icon}</div>
      <div className="flex items-center gap-2 flex-1">
        <label className="text-gray-800 font-medium text-sm">{label}</label>
        <span className="text-gray-500">:</span>
        <div className="flex-1">
          {isEditing ? (
            <input
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-blue-50 text-gray-800 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:bg-white outline-none transition-all"
              placeholder={label}
            />
          ) : (
            <span className="text-gray-800 text-sm font-medium">{value}</span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default PatientInfoSection;
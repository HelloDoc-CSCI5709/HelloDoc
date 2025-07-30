import React, { useEffect, useState, type JSX } from 'react';
import {
  Phone, Edit3, Save, X, User, FileText, PhoneCall
} from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../../constant_url';

interface Patient {
  fullName: string;
  gender: string;
  dob: string;
  mobile: string;
  emergencyContact: string;
  email: string;
  image: string;
}

const PatientInfoSection: React.FC<{ patient: Patient | null }> = ({ patient }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localPatient, setLocalPatient] = useState<Patient | null>(null);
  
  // const [patient, setPatient] = useState<Patient>({
  //   fullName: '',
  //   gender: '',
  //   dob: '',
  //   mobile: '',
  //   emergencyContact: '',
  //   email: '',
  //   image: 'https://ui-avatars.com/api/?name=Patient',
  // });

  const token = localStorage.getItem('accessToken');

  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     try {
  //       const res = await axios.get(`${BASE_URL}/api/patient/profile`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       const user = res.data?.body?.user || {};
  //       const profile = res.data?.body?.profile || {};

  //       setPatient({
  //         fullName: user.fullName || '',
  //         gender: profile.gender || '',
  //         dob: profile.dob ? profile.dob.slice(0, 10) : '',
  //         mobile: profile.mobile || '',
  //         emergencyContact: profile.emergencyContact || '',
  //         email: user.email || '',
  //         image: `https://ui-avatars.com/api/?name=${user.fullName || 'Patient'}`,
  //       });
  //     } catch (err) {
  //       console.error('Failed to fetch patient info', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProfile();
  // }, [token]);

  useEffect(() => {
    if (patient) {
      setLocalPatient(patient);
    }
  }, [patient]);

  if (!localPatient) return <div>Loading...</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalPatient((prev) => ({ ...prev!, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${BASE_URL}/api/patient/profile`,
        {
          mobile: localPatient.mobile,
          dob: localPatient.dob,
          gender: localPatient.gender,
          emergencyContact: localPatient.emergencyContact,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setIsEditing(false);
      alert('Profile updated successfully.');
    } catch (err) {
      console.error('Error updating profile', err);
    } finally {
      setSaving(false);
    }
  };

  // if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-blue-100 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Patient Information</h3>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img src={localPatient.image} alt="Patient" className="w-16 h-16 rounded-full object-cover shadow-sm" />
            <div>
              <h2 className="text-gray-800 font-semibold text-lg">{localPatient.fullName}</h2>
              <p className="text-gray-500 text-sm">{localPatient.gender}</p>
            </div>
          </div>

          <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-2 rounded text-sm transition-all bg-blue-600 text-white hover:bg-blue-700">
            {isEditing ? (
              <><X className="w-4 h-4 inline-block mr-2" />Cancel</>
            ) : (
              <><Edit3 className="w-4 h-4 inline-block mr-2" />Edit Profile</>
            )}
          </button>
        </div>

        <div className="grid gap-3">
          <InfoRow icon={<Phone className="w-5 h-5" />} label="Mobile" isEditing={isEditing} name="mobile" value={localPatient.mobile} onChange={handleChange} />
          <InfoRow icon={<User className="w-5 h-5" />} label="Date of Birth" isEditing={isEditing} name="dob" value={localPatient.dob} onChange={handleChange} type="date" />
          <InfoRow icon={<PhoneCall className="w-5 h-5" />} label="Emergency Contact" isEditing={isEditing} name="emergencyContact" value={localPatient.emergencyContact} onChange={handleChange} />
          <InfoRow icon={<FileText className="w-5 h-5" />} label="Gender" isEditing={isEditing} name="gender" value={localPatient.gender} onChange={handleChange} />
          <InfoRow icon={<FileText className="w-5 h-5" />} label="Email" isEditing={false} name="email" value={localPatient.email} onChange={() => {}} />
        </div>

        {isEditing && (
          <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm" disabled={saving}>
              <Save className="w-4 h-4 inline-block mr-2" />{saving ? 'Saving...' : 'Save Changes'}
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
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
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
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-blue-50 text-gray-800 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:bg-white outline-none"
              placeholder={label}
            />
          ) : (
            <span className="text-gray-800 text-sm font-medium truncate block" title={value}>{value}</span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default PatientInfoSection;
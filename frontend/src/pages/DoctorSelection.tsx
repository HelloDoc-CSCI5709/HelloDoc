import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorCard, { type Doctor } from '../components/Patient/DoctorCard';
import Sidebar from '../components/Patient/LeftSidebar';
import TopNavBar from '../components/Patient/TopNavbar';
import axios from 'axios';

interface RawDoctor {
  doctorId?: {
    _id: string;
    fullName: string;
  };
  specialization?: string[];
  address?: string;
  education?: string;
}

const DoctorSelection: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');

      const res = await axios.get<{
        body: { doctors: RawDoctor[] };
      }>(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/doctors/list/all`,
        {
          headers: {
            // if there's no token, this will send an empty string
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      const fetched: RawDoctor[] = res.data?.body?.doctors || [];

      const mappedDoctors: Doctor[] = fetched.map((doc) => ({
        doctorId:     doc.doctorId?._id                || '',
        name:         doc.doctorId?.fullName           || 'Doctor',
        specialty:    doc.specialization?.[0]          || 'General',
        clinic:       doc.address                      || 'Clinic address unavailable',
        experience:   doc.education                    || 'Experience info unavailable',
        rating:       '4.5',
        reviews:      123,
        nextAvailable:'Available now',
        image:        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                         doc.doctorId?.fullName || 'Doctor'
                       )}`,
      }));

      setDoctors(mappedDoctors);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchDoctors();
}, []);

  const handleSchedule = (doctor: Doctor) => {
    localStorage.setItem("selectedDoctor", JSON.stringify(doctor));
    navigate('/doctor-profile');
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-[80px] bg-blue-600 text-white">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="w-full border-b shadow-sm">
          <TopNavBar />
        </div>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">
              All the available doctors near you
            </h2>

            {loading ? (
              <p className="text-gray-600">Loading doctors...</p>
            ) : doctors.length === 0 ? (
              <p className="text-gray-600">No doctors found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doc, i) => (
                  <DoctorCard key={i} doctor={doc} onSchedule={handleSchedule} />
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => navigate('/book-appointment')}
                className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 text-sm"
              >
                Back
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorSelection;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorCard, { type Doctor } from '../components/Patient/DoctorCard';
import Sidebar from '../components/Patient/LeftSidebar';
import TopNavBar from '../components/Patient/TopNavbar';
import axios from 'axios';

const DoctorSelection = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/doctors/list/all`);
        const fetched = res.data?.body?.doctors || [];

        const mappedDoctors: Doctor[] = fetched.map((doc: any) => ({
          doctorId: doc.doctorId?._id || '', // ✅ include doctorId
          name: doc.doctorId?.fullName || 'Doctor',
          specialty: doc.specialization?.[0] || 'General',
          clinic: doc.address || 'Clinic address unavailable',
          experience: doc.education || 'Experience info unavailable',
          rating: '4.5', // placeholder rating
          reviews: 123,  // placeholder review count
          nextAvailable: 'Available now',
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.doctorId?.fullName || 'Doctor')}`
        }));

        console.log("Fetched doctors:", fetched);
        console.log("Mapped doctors:", mappedDoctors);

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

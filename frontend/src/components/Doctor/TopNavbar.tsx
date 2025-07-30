import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopNavbar: React.FC = () => {
  const [fullName, setFullName] = useState('Loading...');
  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorName = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/doctors/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok && data.body?.user?.fullName) {
          setFullName(data.body.user.fullName);
        } else {
          setFullName('Doctor');
        }
      } catch (error) {
        console.error('Error fetching doctor profile:', error);
        setFullName('Doctor');
      }
    };

    if (token) {
      fetchDoctorName();
    }
  }, [token]);

  const handleProfileClick = () => {
    navigate('/doctor-profile');
  };

  return (
    <header className="w-full bg-white shadow-sm px-6 py-3 flex justify-end items-center gap-6">
      <div
        onClick={handleProfileClick}
        className="flex items-center gap-2 rounded-full px-3 py-1 transition cursor-pointer hover:bg-gray-100"
      >
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-gray-700 capitalize">{fullName}</span>
      </div>
    </header>
  );
};

export default TopNavbar;

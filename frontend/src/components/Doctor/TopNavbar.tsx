import React, { useEffect, useState } from 'react';

const TopNavbar: React.FC = () => {
  const [fullName, setFullName] = useState('Loading...');
  const token = localStorage.getItem('accessToken');

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

  return (
    <header className="w-full bg-white shadow-sm px-6 py-3 flex justify-end items-center">
      <span className="text-sm font-medium text-gray-700 capitalize">{fullName}</span>
    </header>
  );
};

export default TopNavbar;

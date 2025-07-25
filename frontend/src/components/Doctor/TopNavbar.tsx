import React from 'react';
import { Bell } from 'lucide-react';

const TopNavbar: React.FC = () => {
  return (
    <header className="w-full bg-white shadow-sm px-6 py-3 flex justify-end items-center gap-6">
      {/* Notification */}
      <button
        aria-label="Notifications"
        className="text-gray-500 hover:text-blue-600 transition"
      >
        <Bell className="w-6 h-6" />
      </button>

      {/* Profile */}
      <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-full px-3 py-1 transition">
        <img
          src="https://ui-avatars.com/api/?name=Dr+Kim" 
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-gray-700">Dr. Kim</span>
      </div>
    </header>
  );
};

export default TopNavbar;
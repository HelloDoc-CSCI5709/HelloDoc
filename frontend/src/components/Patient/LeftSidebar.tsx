import React, { useState } from 'react';
import {
  LayoutGrid,
  Calendar,
  MessageCircle,
  BookOpen,
  Settings,
  LogOut,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: <LayoutGrid />, to: '/patient-dashboard' },
  { label: 'calendar', icon: <Calendar />, to: '/patient-calendar' },
  { label: 'Chat', icon: <MessageCircle />, to: '/chat' },
  { label: 'appointment-booking', icon: <BookOpen />, to: '/book-appointment' },
  { label: 'Settings', icon: <Settings />, to: '/patient-profile' },
];

const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutConfirm = () => {
    setShowConfirm(false);
    navigate('/');
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="h-screen w-20 bg-blue-600 text-white flex flex-col items-center shadow-md fixed top-14 left-0 pt-6 space-y-6 z-10">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              `p-3 rounded-xl hover:bg-blue-500 transition-colors ${
                isActive ? 'bg-white text-blue-600' : ''
              }`
            }
          >
            <div className="flex justify-center">{item.icon}</div>
          </NavLink>
        ))}

        <button
          onClick={() => setShowConfirm(true)}
          className="p-3 hover:bg-blue-500 rounded-xl transition-colors"
        >
          <LogOut />
        </button>
      </aside>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Are you sure you want to log out?</h3>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeftSidebar;

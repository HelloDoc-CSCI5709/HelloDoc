import React from 'react';
import { Search, Bell, Settings, User } from 'lucide-react';

interface DashboardHeaderProps {
  doctor: {
    name: string;
    profileImage?: string;
    email: string;
  };
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  doctor,
  onSearch,
  onNotificationClick,
  onProfileClick,
  onSettingsClick
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients, appointments..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Bell className="w-6 h-6" />
            {/* Notification Badge */}
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button
            onClick={onSettingsClick}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <img
                src={doctor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=3b82f6&color=fff`}
                alt="Doctor Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-700">{doctor.name}</p>
                <p className="text-gray-500 text-xs">{doctor.email}</p>
              </div>
            </div>
            <button
              onClick={onProfileClick}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

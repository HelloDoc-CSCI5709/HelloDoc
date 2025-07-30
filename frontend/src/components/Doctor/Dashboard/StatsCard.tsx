import React from 'react';
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle } from 'lucide-react';

interface StatsCardProps {
  stats: {
    totalVisits: number;
    newPatients: number;
    oldPatients: number;
    todayAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
  } | null;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="animate-pulse">
          <div className="h-4 bg-white bg-opacity-20 rounded mb-4 w-1/2"></div>
          <div className="h-8 bg-white bg-opacity-20 rounded mb-6 w-1/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 backdrop-blur rounded-xl p-4">
              <div className="h-4 bg-white bg-opacity-20 rounded mb-2"></div>
              <div className="h-6 bg-white bg-opacity-20 rounded mb-2"></div>
              <div className="h-3 bg-white bg-opacity-20 rounded"></div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-4">
              <div className="h-4 bg-white bg-opacity-20 rounded mb-2"></div>
              <div className="h-6 bg-white bg-opacity-20 rounded mb-2"></div>
              <div className="h-3 bg-white bg-opacity-20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute right-0 top-0 w-32 h-32 opacity-20">
        <Users className="w-full h-full" />
      </div>
      
      <div className="relative z-10">
        <h2 className="text-lg font-medium mb-4">Today's Overview</h2>
        <div className="text-4xl font-bold mb-6">{stats.todayAppointments}</div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">New Patients</span>
              <TrendingUp className="w-4 h-4 text-green-300" />
            </div>
            <div className="text-2xl font-bold">{stats.newPatients}</div>
            <div className="text-sm text-green-300">
              {stats.totalVisits > 0 ? Math.round((stats.newPatients / stats.totalVisits) * 100) : 0}% of total
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Follow-ups</span>
              <TrendingDown className="w-4 h-4 text-blue-300" />
            </div>
            <div className="text-2xl font-bold">{stats.oldPatients}</div>
            <div className="text-sm text-blue-300">
              {stats.totalVisits > 0 ? Math.round((stats.oldPatients / stats.totalVisits) * 100) : 0}% of total
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 backdrop-blur rounded-xl p-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-300" />
              <span className="text-sm">Pending: {stats.pendingAppointments}</span>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur rounded-xl p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-sm">Completed: {stats.completedAppointments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

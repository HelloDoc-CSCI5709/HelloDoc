import React from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, Clock, CheckCircle, } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, color, loading }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    red: 'bg-red-500 text-white',
    purple: 'bg-purple-500 text-white'
  };

  const bgColorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${bgColorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      
      {trend && (
        <div className="flex items-center space-x-1">
          {trend.isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value}%
          </span>
          <span className="text-sm text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

interface DashboardMetricsProps {
  stats: {
    totalVisits: number;
    newPatients: number;
    oldPatients: number;
    todayAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
  } | null;
  loading?: boolean;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ stats, loading }) => {
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change >= 0
    };
  };

  // Mock previous data for trend calculation (in real app, this would come from API)
  const previousStats = {
    totalVisits: stats ? stats.totalVisits - 5 : 0,
    newPatients: stats ? stats.newPatients - 2 : 0,
    todayAppointments: stats ? stats.todayAppointments - 3 : 0,
    completedAppointments: stats ? stats.completedAppointments - 1 : 0,
  };

  const metrics = [
    {
      title: "Today's Appointments",
      value: stats?.todayAppointments || 0,
      icon: <Calendar className="w-5 h-5" />,
      color: 'blue' as const,
      trend: stats ? {
        ...calculateTrend(stats.todayAppointments, previousStats.todayAppointments),
        label: 'vs yesterday'
      } : undefined
    },
    {
      title: "New Patients",
      value: stats?.newPatients || 0,
      icon: <Users className="w-5 h-5" />,
      color: 'green' as const,
      trend: stats ? {
        ...calculateTrend(stats.newPatients, previousStats.newPatients),
        label: 'this month'
      } : undefined
    },
    {
      title: "Pending Appointments",
      value: stats?.pendingAppointments || 0,
      icon: <Clock className="w-5 h-5" />,
      color: 'yellow' as const,
      trend: {
        value: 0,
        isPositive: true,
        label: 'awaiting'
      }
    },
    {
      title: "Completed Today",
      value: stats?.completedAppointments || 0,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'purple' as const,
      trend: stats ? {
        ...calculateTrend(stats.completedAppointments, previousStats.completedAppointments),
        label: 'vs yesterday'
      } : undefined
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          color={metric.color}
          trend={metric.trend}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default DashboardMetrics;

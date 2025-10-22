import { useAdminStats } from '@/hooks';
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export function DashboardOverview() {
  const { data: stats, isLoading, isError } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
          </div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <p className="text-red-800">Failed to load statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Teachers',
      value: stats.total_teachers,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Total Classes',
      value: stats.total_classes,
      icon: BookOpen,
      color: 'bg-green-50 text-green-600',
      iconColor: 'text-green-600',
    },
    {
      label: 'Total Students',
      value: stats.total_students,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Total Appointments',
      value: stats.total_appointments,
      icon: Calendar,
      color: 'bg-orange-50 text-orange-600',
      iconColor: 'text-orange-600',
    },
  ];

  const appointmentStats = [
    {
      label: 'Pending',
      value: stats.pending_appointments,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      badgeColor: 'bg-yellow-100',
    },
    {
      label: 'Confirmed',
      value: stats.confirmed_appointments,
      color: 'bg-green-50 border-green-200 text-green-800',
      badgeColor: 'bg-green-100',
    },
    {
      label: 'Rejected',
      value: stats.rejected_appointments,
      color: 'bg-red-50 border-red-200 text-red-800',
      badgeColor: 'bg-red-100',
    },
    {
      label: 'Cancelled',
      value: stats.cancelled_appointments,
      color: 'bg-gray-50 border-gray-200 text-gray-800',
      badgeColor: 'bg-gray-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} rounded-lg p-3`}>
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Appointment Status Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Appointment Status Breakdown</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {appointmentStats.map((stat, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-4 ${stat.color}`}
            >
              <p className="text-sm font-medium">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-2xl font-bold">{stat.value}</p>
                <span className={`${stat.badgeColor} px-2 py-1 rounded text-xs font-medium`}>
                  {stats.total_appointments > 0
                    ? Math.round((stat.value / stats.total_appointments) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 text-sm">
          <strong>System Health:</strong> All systems operational. {stats.total_appointments} appointments managed across {stats.total_classes} classes with {stats.total_teachers} teachers.
        </p>
      </div>
    </div>
  );
}

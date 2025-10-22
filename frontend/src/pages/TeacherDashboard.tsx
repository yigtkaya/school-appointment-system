import { useState } from 'react';
import { useMe, useTeacherAppointments, useTeacherSlots } from '@/hooks';
import { DashboardHeader } from '../components/TeacherDashboard/DashboardHeader';
import { DashboardTabs } from '../components/TeacherDashboard/DashboardTabs';
import { AppointmentsList } from '../components/TeacherDashboard/AppointmentsList';
import { SlotManagement } from '../components/TeacherDashboard/SlotManagement';
import { StudentManagement } from '../components/TeacherDashboard/StudentManagement';
import { ProfileSettings } from '../components/TeacherDashboard/ProfileSettings';

type TabType = 'appointments' | 'slots' | 'students' | 'profile';

/**
 * Teacher Dashboard - Main container component
 * 
 * Displays:
 * - Upcoming appointments with approval/rejection options
 * - Available time slots management
 * - Profile settings
 */
export function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('appointments');

  // Get current teacher profile
  const profileQuery = useMe();
  const { data: currentUser, isLoading: profileLoading } = profileQuery;

  // Get teacher's appointments and slots
  const appointmentsQuery = useTeacherAppointments(currentUser?.id || 0);
  const slotsQuery = useTeacherSlots(currentUser?.id || 0);

  const isLoading = profileLoading || appointmentsQuery.isLoading || slotsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load dashboard</p>
          <p className="text-gray-600 text-sm">{profileQuery.error?.message}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Not authenticated</p>
      </div>
    );
  }

  // Calculate dashboard stats
  const appointmentStats = {
    pending:
      appointmentsQuery.data?.filter((apt: { status: string }) => apt.status === 'pending')
        .length || 0,
    confirmed:
      appointmentsQuery.data?.filter((apt: { status: string }) => apt.status === 'confirmed')
        .length || 0,
    total: appointmentsQuery.data?.length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with stats */}
      <DashboardHeader
        teacher={currentUser}
        stats={appointmentStats}
      />

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={appointmentStats.pending}
        />

        {/* Tab content */}
        <div className="mt-6">
          {activeTab === 'appointments' && (
            <AppointmentsList
              appointments={appointmentsQuery.data || []}
              isLoading={appointmentsQuery.isLoading}
              onAppointmentUpdate={() => appointmentsQuery.refetch()}
            />
          )}

          {activeTab === 'slots' && (
            <SlotManagement
              teacherId={currentUser.id}
              slots={slotsQuery.data || []}
              isLoading={slotsQuery.isLoading}
              onSlotsUpdate={() => slotsQuery.refetch()}
            />
          )}

          {activeTab === 'students' && (
            <StudentManagement teacherId={currentUser.id} />
          )}

          {activeTab === 'profile' && (
            <ProfileSettings
              teacher={currentUser}
              onProfileUpdate={() => profileQuery.refetch()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;

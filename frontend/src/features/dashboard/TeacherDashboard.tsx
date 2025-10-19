import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useTeacherAppointments, useTeacherPendingAppointments, useTeacherTodaysAppointments } from '@/hooks/appointments'
import { StatsCards } from './components/StatsCards'
import { PendingAppointments } from './components/PendingAppointments'
import { TodaysSchedule } from './components/TodaysSchedule'
import { AllAppointmentsList } from './components/AllAppointmentsList'
import { CalendarView } from './components/CalendarView'
import { QuickActionsCard } from './components/QuickActionsCard'
import { useAppointmentActions } from './hooks/useAppointmentActions'
import { getWeekStart } from './utils/calendarUtils'
import { TeacherSlotManagement } from '@/features/teacher/TeacherSlotManagement'

type ViewMode = 'dashboard' | 'all-appointments' | 'calendar' | 'manage-slots'

export function TeacherDashboard() {
  const { user } = useAuthStore()
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard')
  const { handleConfirm, handleReject, confirmMutation, rejectMutation } = useAppointmentActions()
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()))

  // Get pending appointments (top priority)
  const { data: pendingAppointments } = useTeacherPendingAppointments(user?.id || '')

  // Get all appointments
  const { data: allAppointments } = useTeacherAppointments(user?.id || '')

  // Get today's appointments
  const { data: todaysAppointments } = useTeacherTodaysAppointments(user?.id || '')

  const renderDashboard = () => (
    <div className="space-y-8">
      <StatsCards
        pending={pendingAppointments?.length || 0}
        today={todaysAppointments?.length || 0}
        total={allAppointments?.length || 0}
        confirmed={allAppointments?.filter((apt) => apt.status === 'confirmed').length || 0}
      />
      <PendingAppointments
        appointments={pendingAppointments}
        onConfirm={handleConfirm}
        onReject={handleReject}
        isConfirming={confirmMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TodaysSchedule appointments={todaysAppointments} />
        <QuickActionsCard
          onViewCalendar={() => setCurrentView('calendar')}
          onViewAllAppointments={() => setCurrentView('all-appointments')}
          onManageSlots={() => setCurrentView('manage-slots')}
        />
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'all-appointments' && (
          <AllAppointmentsList
            appointments={allAppointments}
            onConfirm={handleConfirm}
            onReject={handleReject}
          />
        )}
        {currentView === 'calendar' && (
          <CalendarView
            appointments={allAppointments}
            currentWeek={currentWeek}
            onWeekChange={setCurrentWeek}
            onConfirm={handleConfirm}
            onReject={handleReject}
          />
        )}
        {currentView === 'manage-slots' && <TeacherSlotManagement />}
      </div>
    </DashboardLayout>
  )
}
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types/api'
import { AdminDashboard } from '@/features/dashboard/AdminDashboard'
import { TeacherDashboard } from '@/features/dashboard/TeacherDashboard'
import { ParentDashboard } from '@/features/dashboard/ParentDashboard'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: Dashboard,
})

function Dashboard() {
  const { user } = useAuthStore()

  if (!user) {
    return null
  }

  switch (user.role) {
    case UserRole.ADMIN:
      return <AdminDashboard />
    case UserRole.TEACHER:
      return <TeacherDashboard />
    case UserRole.PARENT:
      return <ParentDashboard />
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="mt-2 text-gray-600">Invalid user role</p>
          </div>
        </div>
      )
  }
}
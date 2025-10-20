import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types/api'
import { AdminDashboard } from '@/features/dashboard/AdminDashboard'
import { TeacherDashboard } from '@/features/dashboard/TeacherDashboard'
import { requireAuth } from '@/lib/auth-utils'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth)
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
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="mt-2 text-gray-600">This dashboard is for staff only. Parents can book appointments from the home page.</p>
          </div>
        </div>
      )
  }
}
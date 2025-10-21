import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types/api'
import { AdminDashboard } from '@/features/dashboard/AdminDashboard'
import { TeacherDashboard } from '@/features/dashboard/TeacherDashboard'
import { requireAuth } from '@/lib/auth-utils'
import { ParentDashboard } from '@/features/dashboard/ParentDashboard'

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
      return <ParentDashboard isPublic={true} />
  }
}
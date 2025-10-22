import { AdminDashboard } from "@/components/AdminDashboard/AdminDashboard"
import TeacherDashboard from "@/pages/TeacherDashboard"
import { useAuthStore } from "@/store/auth"
import { createFileRoute } from "@tanstack/react-router"


export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { user } = useAuthStore()

  if (!user) {
    return <TeacherDashboard/>
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />
    case 'teacher':
      return <TeacherDashboard />
    default:
      return <TeacherDashboard/>
  }
}
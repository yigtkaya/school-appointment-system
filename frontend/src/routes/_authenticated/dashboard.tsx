import IndexPage from "@/pages"
import TeacherDashboard from "@/pages/TeacherDashboard"
import { useAuthStore } from "@/store/auth"
import { createFileRoute } from "@tanstack/react-router"


export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { user } = useAuthStore()

  if (!user) {
    return <IndexPage/>
  }

  switch (user.role) {
    case 'admin':
      return <IndexPage />
    case 'teacher':
      return <TeacherDashboard />
    default:
      return <IndexPage/>
  }
}
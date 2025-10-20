import { createFileRoute } from '@tanstack/react-router'
import { ParentDashboard } from '@/features/dashboard/ParentDashboard'

export const Route = createFileRoute('/parent')({
  component: ParentDashboardPublic,
})

function ParentDashboardPublic() {
  return <ParentDashboard isPublic={true} />
}

import type { User } from '@/api/types'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

export interface RouterContext {
  auth: {
    isAuthenticated: boolean
    user: User | null
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
    </>
  )
}
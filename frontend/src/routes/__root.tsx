import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { User } from '@/types/schemas'

export interface RouterContext {
  authentication: {
    isAuthenticated: boolean
    user: User | null
    token: string | null
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
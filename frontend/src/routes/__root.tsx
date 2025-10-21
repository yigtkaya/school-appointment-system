import type { User } from '@/types'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

export interface RouterContext {
  authState: {
    token: string | null
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
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
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useAuthStore } from '@/stores/auth'

export const Route = createRootRoute({
  component: RootComponent,
  beforeLoad: async () => {
    // Initialize auth state by checking for stored token
    await useAuthStore.getState().checkAuth()
    
    return {
      auth: {
        isAuthenticated: useAuthStore.getState().isAuthenticated,
        user: useAuthStore.getState().user,
      },
    }
  },
})

function RootComponent() {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  )
}
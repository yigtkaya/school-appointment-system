import { createRouter, RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { Toaster } from "@/components/ui/sonner"
import { useEffect } from 'react'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import type { RouterContext } from './routes/__root'

// Create a new router instance
const router = createRouter({ 
  routeTree,
  context: {
    auth: {
      isAuthenticated: false,
      user: null,
    },
  } satisfies RouterContext,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function InnerApp() {
  const { user, isAuthenticated, setUser } = useAuthStore()

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data')
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        } catch (error) {
          console.error('Failed to parse user data from localStorage:', error)
          localStorage.removeItem('user_data')
        }
      }
    }
  }, [setUser])

  const auth = {
    isAuthenticated,
    user,
  }

  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InnerApp />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App

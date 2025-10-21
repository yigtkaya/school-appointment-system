import { createRouter, RouterProvider } from '@tanstack/react-router'
import { useAuthStore } from './store/auth'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  context: {
    authentication: undefined!,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  const authStore = useAuthStore()

  return (
    <RouterProvider
      router={router}
      context={{
        authentication: {
          isAuthenticated: authStore.isAuthenticated,
          user: authStore.user,
          token: authStore.token,
        },
      }}
    />
  )
}

export default App

import { createRouter, RouterProvider } from '@tanstack/react-router'
import { useAuthStore } from './store/auth'
import { routeTree } from './routeTree.gen'
import type { RouterContext } from './routes/__root'

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  } as RouterContext,
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
        auth: {
          isAuthenticated: authStore.isAuthenticated,
          user: authStore.user,
        },
      }}
    />
  )
}

export default App

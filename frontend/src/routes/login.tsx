import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginComponent,
})

function LoginComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <h2 className="text-center text-3xl font-bold">Sign in</h2>
        <p className="text-center text-gray-600">Login page - implement your login form here</p>
      </div>
    </div>
  )
}
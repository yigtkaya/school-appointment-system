import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth/LoginForm'
import { z } from 'zod'
import { redirectIfAuthenticated } from '@/lib/auth-utils'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: ({ context, search }) => {
    redirectIfAuthenticated(context.auth, search.redirect || '/dashboard')
  },
  component: LoginComponent,
})

function LoginComponent() {
  return <LoginForm />
}
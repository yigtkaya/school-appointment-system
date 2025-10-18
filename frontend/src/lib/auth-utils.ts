import { redirect } from '@tanstack/react-router'
import type { RouterContext } from '@/routes/__root'
import type { UserRole } from '@/types/api'

/**
 * Utility function to check if user is authenticated
 */
export const requireAuth = (context: RouterContext['auth'], redirectTo = '/login') => {
  if (!context.isAuthenticated) {
    throw redirect({ to: redirectTo })
  }
}

/**
 * Utility function to check if user has required role
 */
export const requireRole = (
  context: RouterContext['auth'],
  requiredRole: UserRole,
  redirectTo = '/dashboard'
) => {
  requireAuth(context)
  
  if (context.user?.role !== requiredRole) {
    throw redirect({ to: redirectTo })
  }
}

/**
 * Utility function to check if user has any of the required roles
 */
export const requireAnyRole = (
  context: RouterContext['auth'],
  requiredRoles: UserRole[],
  redirectTo = '/dashboard'
) => {
  requireAuth(context)
  
  if (!context.user?.role || !requiredRoles.includes(context.user.role)) {
    throw redirect({ to: redirectTo })
  }
}

/**
 * Utility function to redirect authenticated users away from auth pages
 */
export const redirectIfAuthenticated = (
  context: RouterContext['auth'],
  redirectTo = '/dashboard'
) => {
  if (context.isAuthenticated) {
    throw redirect({ to: redirectTo })
  }
}
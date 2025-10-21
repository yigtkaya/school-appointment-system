import type { ReactNode } from 'react';
import { useAuthStore } from '../store/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'parent';
}

/**
 * Protected route wrapper that checks authentication and role
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <div className="flex items-center justify-center min-h-screen">Unauthorized</div>;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Access Denied - Role Required: {requiredRole}
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has required role
 */
export function useHasRole(requiredRole: string | string[]): boolean {
  const user = useAuthStore((state) => state.user);

  if (!user) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }

  return user.role === requiredRole;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => state.isAuthenticated);
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

/**
 * Hook to get auth token
 */
export function useAuthToken() {
  const storage = localStorage.getItem('auth-storage');
  return storage ? JSON.parse(storage).state?.token : null;
}

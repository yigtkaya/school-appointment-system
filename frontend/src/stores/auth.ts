import { create } from 'zustand'
import { authAPI } from '@/api/auth'
import type { User, UserRole } from '@/types/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  logout: () => void
  clearAuthData: () => void
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,

  // Actions
  setUser: (user: User | null) => {
    // Store user data in localStorage for persistence
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user_data', JSON.stringify(user))
      } else {
        localStorage.removeItem('user_data')
      }
    }

    set({
      user,
      isAuthenticated: !!user,
    })
  },

  logout: () => {
    authAPI.logout()
    set({
      user: null,
      isAuthenticated: false,
    })
  },

  clearAuthData: () => {
    // Clear user data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data')
    }
    set({
      user: null,
      isAuthenticated: false,
    })
  },
}))

// Selectors
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)

// Role-based helpers
export const useUserRole = (): UserRole | null => {
  const user = useUser()
  return user?.role || null
}

export const useIsAdmin = () => {
  const role = useUserRole()
  return role === 'admin'
}

export const useIsTeacher = () => {
  const role = useUserRole()
  return role === 'teacher'
}

export const useIsParent = () => {
  const role = useUserRole()
  return role === 'parent'
}
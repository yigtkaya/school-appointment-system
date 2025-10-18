import { create } from 'zustand'
import { authAPI } from '@/api/auth'
import type { User, UserRole } from '@/types/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  checkAuth: () => Promise<void>
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await authAPI.login({ email, password })
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      })
      throw error
    }
  },

  logout: () => {
    authAPI.logout()
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    })
  },

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
    })
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true })
      
      // Check if token exists
      const token = localStorage.getItem('auth_token')
      if (!token) {
        set({ isLoading: false })
        return
      }

      // Verify token by fetching user info
      const user = await authAPI.me()
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      // Token is invalid, clear it
      authAPI.logout()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },
}))

// Selectors
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)

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
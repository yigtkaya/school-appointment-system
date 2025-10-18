import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest, UserCreate } from '@/types/api'

// Query keys
export const authKeys = {
  me: ['auth', 'me'] as const,
}

// Hook to get current user data
export const useMe = () => {
  const { setUser, clearAuthData } = useAuthStore()
  
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        const user = await authAPI.me()
        setUser(user)
        return user
      } catch (error) {
        clearAuthData()
        throw error
      }
    },
    retry: false,
    staleTime: 5 * 600 * 1000, // 10 minutes
  })
}

// Hook to check authentication on app load
export const useCheckAuth = () => {
  const { setUser, clearAuthData } = useAuthStore()
  
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      // Check if token exists
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        clearAuthData()
        return null
      }

      // Try to get user data from localStorage first
      const storedUserData = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null
      if (storedUserData) {
        try {
          const user = JSON.parse(storedUserData)
          setUser(user)
          // Still verify with API in background but return cached data immediately
          authAPI.me().catch(() => clearAuthData())
          return user
        } catch {
          // If stored user data is invalid, proceed to fetch from API
        }
      }

      try {
        const user = await authAPI.me()
        setUser(user)
        return user
      } catch (error) {
        clearAuthData()
        throw error
        return null
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for login mutation
export const useLogin = () => {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()
  
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await authAPI.login(credentials)
      return response
    },
    onSuccess: (data) => {
      setUser(data.user)
      // Invalidate and refetch user data
      queryClient.setQueryData(authKeys.me, data.user)
    },
    onError: () => {
      // Error handling will be done by the component using the hook
    },
  })
}

// Hook for register mutation
export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: UserCreate) => {
      const user = await authAPI.register(userData)
      return user
    },
  })
}

// Hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()
  
  return useMutation({
    mutationFn: async () => {
      // No API call needed for logout, just clear local data
      logout()
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear()
    },
  })
}

// Hook for token refresh
export const useRefreshToken = () => {
  const queryClient = useQueryClient()
  const { clearAuthData } = useAuthStore()
  
  return useMutation({
    mutationFn: async () => {
      const response = await authAPI.refreshToken()
      return response
    },
    onSuccess: () => {
      // Invalidate user data to refetch with new token
      queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
    onError: () => {
      // If refresh fails, clear auth data
      clearAuthData()
      queryClient.clear()
    },
  })
}
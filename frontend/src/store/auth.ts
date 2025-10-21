import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '../types/schemas';

interface AuthState {
  // State
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  clearError: () => void;
}

/**
 * Authentication store using Zustand
 * Persisted to localStorage for session management
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        setToken: (token: string) =>
          set(
            {
              token,
              isAuthenticated: !!token,
            },
            false,
            'setToken',
          ),

        setUser: (user: User) =>
          set(
            {
              user,
              isAuthenticated: !!user,
            },
            false,
            'setUser',
          ),

        setLoading: (loading: boolean) =>
          set({ isLoading: loading }, false, 'setLoading'),

        setError: (error: string | null) =>
          set({ error }, false, 'setError'),

        login: (user: User, token: string) =>
          set(
            {
              user,
              token,
              isAuthenticated: true,
              error: null,
            },
            false,
            'login',
          ),

        logout: () =>
          set(
            {
              token: null,
              user: null,
              isAuthenticated: false,
              error: null,
            },
            false,
            'logout',
          ),

        clearError: () =>
          set({ error: null }, false, 'clearError'),
      }),
      {
        name: 'auth-storage',
        // Only persist token and user
        partialize: (state) => ({
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    {
      name: 'AuthStore',
    },
  ),
);

/**
 * Selector hooks for better performance and type safety
 */
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

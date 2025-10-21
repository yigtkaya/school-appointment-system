import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { apiGet, apiPost, APIError } from '../api/client';
import { API_ENDPOINTS } from '../lib/config';
import { queryKeys } from './queryKeys';
import type { User } from '../types/schemas';

/**
 * Get current authenticated user profile
 */
export function useProfile(options?: UseQueryOptions<User, APIError>) {
  const token = localStorage.getItem('auth-storage')
    ? JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token
    : null;

  return useQuery({
    queryKey: queryKeys.auth(),
    queryFn: () => apiGet<User>(API_ENDPOINTS.AUTH_PROFILE, token || undefined),
    enabled: !!token,
    ...options,
  });
}

/**
 * Register new user
 */
export function useRegisterMutation(
  options?: UseMutationOptions<
    { access_token: string },
    APIError,
    {
      email: string;
      password: string;
      name: string;
      role: 'teacher' | 'parent';
    }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      apiPost<{ access_token: string }>(API_ENDPOINTS.AUTH_REGISTER, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth() });
    },
    ...options,
  });
}

/**
 * Login user
 */
export function useLoginMutation(
  options?: UseMutationOptions<
    { access_token: string },
    APIError,
    { email: string; password: string }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      apiPost<{ access_token: string }>(API_ENDPOINTS.AUTH_LOGIN, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth() });
    },
    ...options,
  });
}
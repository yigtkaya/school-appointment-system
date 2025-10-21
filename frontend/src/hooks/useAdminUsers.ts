import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../api/client';
import { API_ENDPOINTS } from '../lib/config';
import { queryKeys } from './queryKeys';
import type { User, CreateUser, UpdateUser } from '../types/schemas';

const getToken = () => {
  const storage = localStorage.getItem('auth-storage');
  return storage ? JSON.parse(storage).state?.token : null;
};

/**
 * Get all users (admin only)
 */
export function useUsers(options?: UseQueryOptions<User[], APIError>) {
  const token = getToken();

  return useQuery({
    queryKey: queryKeys.users(),
    queryFn: () => apiGet<User[]>(API_ENDPOINTS.ADMIN_USERS, token || undefined),
    enabled: !!token,
    ...options,
  });
}

/**
 * Get a specific user
 */
export function useUser(id: number, options?: UseQueryOptions<User, APIError>) {
  const token = getToken();

  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () =>
      apiGet<User>(`${API_ENDPOINTS.ADMIN_USERS}/${id}`, token || undefined),
    enabled: !!token && !!id,
    ...options,
  });
}

/**
 * Create a new user (admin only)
 */
export function useCreateUserMutation(
  options?: UseMutationOptions<User, APIError, CreateUser>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (data) =>
      apiPost<User>(API_ENDPOINTS.ADMIN_USERS, data, token || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
    },
    ...options,
  });
}

/**
 * Update a user (admin only)
 */
export function useUpdateUserMutation(
  id: number,
  options?: UseMutationOptions<User, APIError, UpdateUser>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (data) =>
      apiPut<User>(`${API_ENDPOINTS.ADMIN_USERS}/${id}`, data, token || undefined),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
      queryClient.setQueryData(queryKeys.user(id), updatedUser);
    },
    ...options,
  });
}

/**
 * Delete a user (admin only)
 */
export function useDeleteUserMutation(
  options?: UseMutationOptions<void, APIError, number>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (id) =>
      apiDelete(`${API_ENDPOINTS.ADMIN_USERS}/${id}`, token || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
    },
    ...options,
  });
}

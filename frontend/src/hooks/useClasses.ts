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
import type { Class, CreateClass, UpdateClass } from '../types/schemas';

const getToken = () => {
  const storage = localStorage.getItem('auth-storage');
  return storage ? JSON.parse(storage).state?.token : null;
};

/**
 * Get all classes
 */
export function useClasses(options?: UseQueryOptions<Class[], APIError>) {
  const token = getToken();

  return useQuery({
    queryKey: queryKeys.classes(),
    queryFn: () => apiGet<Class[]>(API_ENDPOINTS.CLASSES_LIST, token || undefined),
    enabled: !!token,
    ...options,
  });
}

/**
 * Get a specific class
 */
export function useClass(id: number, options?: UseQueryOptions<Class, APIError>) {
  const token = getToken();

  return useQuery({
    queryKey: queryKeys.class(id),
    queryFn: () => apiGet<Class>(`${API_ENDPOINTS.CLASSES_LIST}/${id}`, token || undefined),
    enabled: !!token && !!id,
    ...options,
  });
}

/**
 * Create a new class (admin only)
 */
export function useCreateClassMutation(
  options?: UseMutationOptions<Class, APIError, CreateClass>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (data) =>
      apiPost<Class>(API_ENDPOINTS.ADMIN_CLASSES_CREATE, data, token || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes() });
    },
    ...options,
  });
}

/**
 * Update a class (admin only)
 */
export function useUpdateClassMutation(
  id: number,
  options?: UseMutationOptions<Class, APIError, UpdateClass>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (data) =>
      apiPut<Class>(`${API_ENDPOINTS.ADMIN_CLASSES_UPDATE}/${id}`, data, token || undefined),
    onSuccess: (updatedClass) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes() });
      queryClient.setQueryData(queryKeys.class(id), updatedClass);
    },
    ...options,
  });
}

/**
 * Delete a class (admin only)
 */
export function useDeleteClassMutation(
  options?: UseMutationOptions<void, APIError, number>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (id) =>
      apiDelete(`${API_ENDPOINTS.ADMIN_CLASSES_UPDATE}/${id}`, token || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes() });
    },
    ...options,
  });
}

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { adminClassesAPI } from '@/api/adminClasses';
import { queryKeys } from './queryKeys';
import type { Class, CreateClass, UpdateClass } from '@/api/types';

/**
 * Get all classes (admin only)
 */
export function useAdminClasses(options?: UseQueryOptions<Class[], Error>) {
  return useQuery({
    queryKey: queryKeys.adminClasses(),
    queryFn: adminClassesAPI.getClasses,
    ...options,
  });
}

/**
 * Get a specific class (admin only)
 */
export function useAdminClass(id: number, options?: UseQueryOptions<Class, Error>) {
  return useQuery({
    queryKey: [...queryKeys.adminClasses(), id],
    queryFn: () => adminClassesAPI.getClassById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new class (admin only)
 */
export function useAdminCreateClassMutation(
  options?: UseMutationOptions<Class, Error, CreateClass>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminClassesAPI.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminClasses() });
    },
    ...options,
  });
}

/**
 * Update a class (admin only)
 */
export function useAdminUpdateClassMutation(
  options?: UseMutationOptions<Class, Error, { id: number; data: UpdateClass }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => adminClassesAPI.updateClass(id, data),
    onSuccess: (updatedClass, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminClasses() });
      queryClient.setQueryData([...queryKeys.adminClasses(), id], updatedClass);
    },
    ...options,
  });
}

/**
 * Delete a class (admin only)
 */
export function useAdminDeleteClassMutation(
  options?: UseMutationOptions<void, Error, number>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminClassesAPI.deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminClasses() });
    },
    ...options,
  });
}

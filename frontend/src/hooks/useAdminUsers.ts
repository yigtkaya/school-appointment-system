import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { usersAPI } from '@/api/users';
import { queryKeys } from './queryKeys';
import type { User, CreateUser, UpdateUser } from '@/api/types';

/**
 * Get all teachers (admin only)
 */
export function useTeachers(options?: UseQueryOptions<User[], Error>) {
  return useQuery({
    queryKey: [...queryKeys.users(), 'teachers'],
    queryFn: usersAPI.getTeachers,
    ...options,
  });
}

/**
 * Get a specific teacher (admin only)
 */
export function useTeacher(id: number, options?: UseQueryOptions<User, Error>) {
  return useQuery({
    queryKey: [...queryKeys.users(), 'teachers', id],
    queryFn: () => usersAPI.getTeacherById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new teacher (admin only)
 */
export function useCreateTeacherMutation(
  options?: UseMutationOptions<User, Error, CreateUser>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.createTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
    },
    ...options,
  });
}

/**
 * Update a teacher (admin only)
 */
export function useUpdateTeacherMutation(
  options?: UseMutationOptions<User, Error, { id: number; data: UpdateUser }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => usersAPI.updateTeacher(id, data),
    onSuccess: (updatedUser, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
      queryClient.setQueryData([...queryKeys.users(), 'teachers', id], updatedUser);
    },
    ...options,
  });
}

/**
 * Delete a teacher (admin only)
 */
export function useDeleteTeacherMutation(
  options?: UseMutationOptions<void, Error, number>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.deleteTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
    },
    ...options,
  });
}

/**
 * Approve a teacher account (admin only)
 */
export function useApproveTeacherMutation(
  options?: UseMutationOptions<User, Error, number>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.approveTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
    },
    ...options,
  });
}

/**
 * Require approval for teacher (admin only)
 */
export function useRequireApprovalMutation(
  options?: UseMutationOptions<User, Error, number>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.requireApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
    },
    ...options,
  });
}

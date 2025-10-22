import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { classesAPI } from '@/api/classes';
import { queryKeys } from './queryKeys';
import type { Class, CreateClass, UpdateClass, User, TeacherClassAssignment } from '@/api/types';

/**
 * Get all classes (public)
 */
export function useClasses(options?: UseQueryOptions<Class[], Error>) {
  return useQuery({
    queryKey: queryKeys.classes(),
    queryFn: classesAPI.getAll,
    ...options,
  });
}

/**
 * Get a specific class (public)
 */
export function useClass(id: number, options?: UseQueryOptions<Class, Error>) {
  return useQuery({
    queryKey: queryKeys.class(id),
    queryFn: () => classesAPI.getById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Get teachers for a specific class
 */
export function useClassTeachers(
  classId: number, 
  options?: UseQueryOptions<User[], Error>
) {
  return useQuery({
    queryKey: [...queryKeys.classes(), classId, 'teachers'],
    queryFn: () => classesAPI.getTeachers(classId),
    enabled: !!classId,
    ...options,
  });
}

/**
 * Create a new class (public endpoint)
 */
export function useCreateClassMutation(
  options?: UseMutationOptions<Class, Error, CreateClass>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes() });
    },
    ...options,
  });
}

/**
 * Create a new class (admin endpoint)
 */
export function useAdminCreateClassMutation(
  options?: UseMutationOptions<Class, Error, CreateClass>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classesAPI.adminCreate,
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
  options?: UseMutationOptions<Class, Error, { id: number; data: UpdateClass }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => classesAPI.adminUpdate(id, data),
    onSuccess: (updatedClass, { id }) => {
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
  options?: UseMutationOptions<void, Error, number>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classesAPI.adminDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes() });
    },
    ...options,
  });
}

/**
 * Assign teacher to class
 */
export function useAssignTeacherMutation(
  options?: UseMutationOptions<TeacherClassAssignment, Error, { teacherId: number; classId: number }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, classId }) => classesAPI.assignTeacher(teacherId, classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes() });
    },
    ...options,
  });
}

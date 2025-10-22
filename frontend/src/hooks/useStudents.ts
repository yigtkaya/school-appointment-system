import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { studentsAPI } from '@/api/students';
import { queryKeys } from './queryKeys';
import type { Student, CreateStudent, UpdateStudent } from '@/api/types';

/**
 * Get a specific student
 */
export function useStudent(id: number, options?: UseQueryOptions<Student, Error>) {
  return useQuery({
    queryKey: queryKeys.student(id),
    queryFn: () => studentsAPI.getById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Get students in a specific class
 */
export function useStudentsByClass(
  classId: number, 
  options?: UseQueryOptions<Student[], Error>
) {
  return useQuery({
    queryKey: [...queryKeys.students(), 'class', classId],
    queryFn: () => studentsAPI.getByClass(classId),
    enabled: !!classId,
    ...options,
  });
}

/**
 * Create a new student (admin only)
 */
export function useCreateStudentMutation(
  options?: UseMutationOptions<Student, Error, CreateStudent>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students() });
    },
    ...options,
  });
}

/**
 * Create a new student (admin endpoint)
 */
export function useAdminCreateStudentMutation(
  options?: UseMutationOptions<Student, Error, CreateStudent>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentsAPI.adminCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students() });
    },
    ...options,
  });
}

/**
 * Update a student (admin only)
 */
export function useUpdateStudentMutation(
  options?: UseMutationOptions<Student, Error, { id: number; data: UpdateStudent }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => studentsAPI.adminUpdate(id, data),
    onSuccess: (updatedStudent, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students() });
      queryClient.setQueryData(queryKeys.student(id), updatedStudent);
    },
    ...options,
  });
}

/**
 * Delete a student (admin only)
 */
export function useDeleteStudentMutation(
  options?: UseMutationOptions<void, Error, number>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentsAPI.adminDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students() });
    },
    ...options,
  });
}

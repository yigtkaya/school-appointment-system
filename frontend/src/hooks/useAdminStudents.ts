import {
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { adminStudentsAPI } from '@/api/adminStudents';
import { useStudentsByClass } from './useStudents';
import { queryKeys } from './queryKeys';
import type { Student, CreateStudent, UpdateStudent } from '@/api/types';

/**
 * Get students by class (uses existing hook)
 * This is primarily used for listing students in a specific class
 */
export function useAdminStudents(classId: number, options?: UseQueryOptions<Student[], Error>) {
  return useStudentsByClass(classId, options);
}

/**
 * Create a new student (admin only)
 */
export function useAdminCreateStudentMutation(
  options?: UseMutationOptions<Student, Error, CreateStudent>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminStudentsAPI.createStudent,
    onSuccess: (newStudent) => {
      // Invalidate students list and class-specific students
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStudents() });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.students(),
      });
      if (newStudent.class_id) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.students(), 'class', newStudent.class_id],
        });
      }
    },
    ...options,
  });
}

/**
 * Update a student (admin only)
 */
export function useAdminUpdateStudentMutation(
  options?: UseMutationOptions<Student, Error, { id: number; data: UpdateStudent }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => adminStudentsAPI.updateStudent(id, data),
    onSuccess: (updatedStudent, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStudents() });
      queryClient.invalidateQueries({ queryKey: queryKeys.students() });
      queryClient.setQueryData([...queryKeys.students(), id], updatedStudent);
      
      // Invalidate old class students list
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.students(), 'class'],
      });
    },
    ...options,
  });
}

/**
 * Delete a student (admin only)
 */
export function useAdminDeleteStudentMutation(
  options?: UseMutationOptions<void, Error, number>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminStudentsAPI.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStudents() });
      queryClient.invalidateQueries({ queryKey: queryKeys.students() });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.students(), 'class'],
      });
    },
    ...options,
  });
}

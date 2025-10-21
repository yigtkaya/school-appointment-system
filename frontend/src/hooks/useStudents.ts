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
import type { Student, CreateStudent, UpdateStudent } from '../types/schemas';

const getToken = () => {
  const storage = localStorage.getItem('auth-storage');
  return storage ? JSON.parse(storage).state?.token : null;
};

/**
 * Get all students (admin only)
 */
export function useStudents(options?: UseQueryOptions<Student[], APIError>) {
  const token = getToken();

  return useQuery({
    queryKey: queryKeys.students(),
    queryFn: () =>
      apiGet<Student[]>(API_ENDPOINTS.ADMIN_STUDENTS_LIST, token || undefined),
    enabled: !!token,
    ...options,
  });
}

/**
 * Get a specific student
 */
export function useStudent(id: number, options?: UseQueryOptions<Student, APIError>) {
  const token = getToken();

  return useQuery({
    queryKey: queryKeys.student(id),
    queryFn: () =>
      apiGet<Student>(
        `${API_ENDPOINTS.ADMIN_STUDENTS_LIST}/${id}`,
        token || undefined,
      ),
    enabled: !!token && !!id,
    ...options,
  });
}

/**
 * Create a new student (admin only)
 */
export function useCreateStudentMutation(
  options?: UseMutationOptions<Student, APIError, CreateStudent>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (data) =>
      apiPost<Student>(API_ENDPOINTS.ADMIN_STUDENTS_CREATE, data, token || undefined),
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
  id: number,
  options?: UseMutationOptions<Student, APIError, UpdateStudent>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (data) =>
      apiPut<Student>(
        `${API_ENDPOINTS.ADMIN_STUDENTS_UPDATE}/${id}`,
        data,
        token || undefined,
      ),
    onSuccess: (updatedStudent) => {
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
  options?: UseMutationOptions<void, APIError, number>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (id) =>
      apiDelete(`${API_ENDPOINTS.ADMIN_STUDENTS_UPDATE}/${id}`, token || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students() });
    },
    ...options,
  });
}

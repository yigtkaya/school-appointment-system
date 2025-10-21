import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete, APIError } from '../api/client';
import { API_ENDPOINTS } from '../lib/config';
import { queryKeys } from './queryKeys';
import type {
  Appointment,
  CreateAppointment,
  UpdateAppointment,
} from '../types/schemas';

const getToken = () => {
  const storage = localStorage.getItem('auth-storage');
  return storage ? JSON.parse(storage).state?.token : null;
};

/**
 * Get all appointments (admin only)
 */
export function useAppointments(options?: UseQueryOptions<Appointment[], APIError>) {
  const token = getToken();

  return useQuery({
    queryKey: queryKeys.appointments(),
    queryFn: () =>
      apiGet<Appointment[]>(
        API_ENDPOINTS.ADMIN_APPOINTMENTS_LIST,
        token || undefined,
      ),
    enabled: !!token,
    ...options,
  });
}

/**
 * Get appointments for a teacher
 */
export function useTeacherAppointments(
  teacherId: number,
  options?: UseQueryOptions<Appointment[], APIError>,
) {
  const token = getToken();

  return useQuery({
    queryKey: queryKeys.teacherAppointments(teacherId),
    queryFn: () =>
      apiGet<Appointment[]>(
        API_ENDPOINTS.TEACHER_APPOINTMENTS_LIST.replace(
          ':teacherId',
          teacherId.toString(),
        ),
        token || undefined,
      ),
    enabled: !!token && !!teacherId,
    ...options,
  });
}

/**
 * Get a specific appointment
 */
export function useAppointment(
  id: number,
  options?: UseQueryOptions<Appointment, APIError>,
) {
  const token = getToken();

  return useQuery({
    queryKey: queryKeys.appointment(id),
    queryFn: () =>
      apiGet<Appointment>(
        `${API_ENDPOINTS.ADMIN_APPOINTMENTS_LIST}/${id}`,
        token || undefined,
      ),
    enabled: !!token && !!id,
    ...options,
  });
}

/**
 * Create a new appointment (public - can be used by parents)
 */
export function useCreateAppointmentMutation(
  options?: UseMutationOptions<Appointment, APIError, CreateAppointment>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (data) =>
      apiPost<Appointment>(
        API_ENDPOINTS.APPOINTMENTS_CREATE,
        data,
        token || undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
    },
    ...options,
  });
}

/**
 * Update an appointment status (admin or teacher)
 */
export function useUpdateAppointmentMutation(
  id: number,
  options?: UseMutationOptions<Appointment, APIError, UpdateAppointment>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (data) =>
      apiPatch<Appointment>(
        `${API_ENDPOINTS.ADMIN_APPOINTMENTS_UPDATE}/${id}`,
        data,
        token || undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
    },
    ...options,
  });
}

/**
 * Delete an appointment (admin or owner)
 */
export function useDeleteAppointmentMutation(
  options?: UseMutationOptions<void, APIError, number>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (id) =>
      apiDelete(
        `${API_ENDPOINTS.ADMIN_APPOINTMENTS_DELETE}/${id}`,
        token || undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
    },
    ...options,
  });
}

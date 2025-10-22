import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { appointmentsAPI } from '@/api/appointments';
import { queryKeys } from './queryKeys';
import type {
  Appointment,
  CreateAppointment,
  UpdateAppointment,
  AppointmentStats,
} from '@/api/types';

/**
 * Get all appointments (admin only)
 */
export function useAppointments(
  params?: { status?: string; teacher_id?: number; class_id?: number },
  options?: UseQueryOptions<Appointment[], Error>
) {
  return useQuery({
    queryKey: queryKeys.appointments(params),
    queryFn: () => appointmentsAPI.getAllAppointments(params),
    ...options,
  });
}

/**
 * Get appointments for a teacher
 */
export function useTeacherAppointments(
  teacherId: number,
  options?: UseQueryOptions<Appointment[], Error>,
) {
  return useQuery({
    queryKey: queryKeys.teacherAppointments(teacherId),
    queryFn: () => appointmentsAPI.getTeacherAppointments(teacherId),
    enabled: !!teacherId,
    ...options,
  });
}

/**
 * Get a specific appointment
 */
export function useAppointment(
  id: number,
  options?: UseQueryOptions<Appointment, Error>,
) {
  return useQuery({
    queryKey: queryKeys.appointment(id),
    queryFn: () => appointmentsAPI.getAppointmentById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Get appointment statistics (admin only)
 */
export function useAppointmentStats(
  options?: UseQueryOptions<AppointmentStats, Error>
) {
  return useQuery({
    queryKey: queryKeys.appointmentStats(),
    queryFn: () => appointmentsAPI.getAppointmentStats(),
    ...options,
  });
}

/**
 * Create a new appointment (public - can be used by parents)
 */
export function useCreateAppointmentMutation(
  options?: UseMutationOptions<Appointment, Error, CreateAppointment>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentsAPI.create,
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
  options?: UseMutationOptions<Appointment, Error, { id: number; data: UpdateAppointment }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => appointmentsAPI.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
    },
    ...options,
  });
}

/**
 * Cancel an appointment (admin or teacher)
 */
export function useCancelAppointmentMutation(
  options?: UseMutationOptions<void, Error, number>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentsAPI.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
    },
    ...options,
  });
}

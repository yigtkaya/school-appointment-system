import {
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { adminAppointmentsAPI } from '@/api/adminAppointments';
import { queryKeys } from './queryKeys';
import type { AppointmentStats } from '@/api/types';

/**
 * Get all appointments with optional filters (admin only)
 */
export function useAdminAllAppointments(
  params?: {
    status?: string
    teacher_id?: number
    class_id?: number
  },
  options?: UseQueryOptions<any[], Error>
) {
  return useQuery({
    queryKey: [...queryKeys.adminAppointments(params)],
    queryFn: () => adminAppointmentsAPI.getAllAppointments(params),
    ...options,
  });
}

/**
 * Get system-wide appointment statistics (admin only)
 */
export function useAdminStats(options?: UseQueryOptions<AppointmentStats, Error>) {
  return useQuery({
    queryKey: queryKeys.adminStats(),
    queryFn: adminAppointmentsAPI.getStats,
    ...options,
  });
}

/**
 * Get specific appointment details (admin only)
 */
export function useAdminAppointment(
  id: number,
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: [...queryKeys.adminAppointments(), id],
    queryFn: () => adminAppointmentsAPI.getAppointmentById(id),
    enabled: !!id,
    ...options,
  });
}

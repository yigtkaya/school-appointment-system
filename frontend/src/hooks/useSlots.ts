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
import type {
  AvailableSlot,
  CreateAvailableSlot,
  UpdateAvailableSlot,
} from '../types/schemas';

const getToken = () => {
  const storage = localStorage.getItem('auth-storage');
  return storage ? JSON.parse(storage).state?.token : null;
};

/**
 * Get available slots for a teacher
 */
export function useTeacherSlots(
  teacherId: number,
  options?: UseQueryOptions<AvailableSlot[], APIError>,
) {
  const token = getToken();

  return useQuery({
    queryKey: queryKeys.teacherSlots(teacherId),
    queryFn: () =>
      apiGet<AvailableSlot[]>(
        API_ENDPOINTS.TEACHER_SLOTS_LIST.replace(':teacherId', teacherId.toString()),
        token || undefined,
      ),
    enabled: !!token && !!teacherId,
    ...options,
  });
}

/**
 * Create a new available slot for a teacher
 */
export function useCreateSlotMutation(
  teacherId: number,
  options?: UseMutationOptions<AvailableSlot, APIError, CreateAvailableSlot>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (data) =>
      apiPost<AvailableSlot>(
        API_ENDPOINTS.TEACHER_SLOTS_CREATE.replace(':teacherId', teacherId.toString()),
        data,
        token || undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teacherSlots(teacherId),
      });
    },
    ...options,
  });
}

/**
 * Update an available slot
 */
export function useUpdateSlotMutation(
  teacherId: number,
  slotId: number,
  options?: UseMutationOptions<AvailableSlot, APIError, UpdateAvailableSlot>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (data) =>
      apiPut<AvailableSlot>(
        `${API_ENDPOINTS.TEACHER_SLOTS_UPDATE.replace(
          ':teacherId',
          teacherId.toString(),
        )}/${slotId}`,
        data,
        token || undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teacherSlots(teacherId),
      });
    },
    ...options,
  });
}

/**
 * Delete an available slot
 */
export function useDeleteSlotMutation(
  teacherId: number,
  options?: UseMutationOptions<void, APIError, number>,
) {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (slotId) =>
      apiDelete(
        `${API_ENDPOINTS.TEACHER_SLOTS_UPDATE.replace(
          ':teacherId',
          teacherId.toString(),
        )}/${slotId}`,
        token || undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teacherSlots(teacherId),
      });
    },
    ...options,
  });
}

/**
 * Get available days for a teacher
 */
export function useTeacherAvailableDays(
  teacherId: number,
  options?: UseQueryOptions<string[], APIError>,
) {
  const token = getToken();

  return useQuery({
    queryKey: [...queryKeys.teacherSlots(teacherId), 'days'],
    queryFn: () =>
      apiGet<string[]>(
        API_ENDPOINTS.TEACHER_AVAILABLE_DAYS(teacherId),
        token || undefined,
      ),
    enabled: !!token && !!teacherId,
    ...options,
  });
}

/**
 * Get available times for a teacher on a specific date
 */
export function useTeacherAvailableTimes(
  teacherId: number,
  date: string,
  options?: UseQueryOptions<string[], APIError>,
) {
  const token = getToken();

  return useQuery({
    queryKey: [...queryKeys.teacherSlots(teacherId), 'times', date],
    queryFn: () =>
      apiGet<string[]>(
        API_ENDPOINTS.TEACHER_AVAILABLE_TIMES(teacherId, date),
        token || undefined,
      ),
    enabled: !!token && !!teacherId && !!date,
    ...options,
  });
}

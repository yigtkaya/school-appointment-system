import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { slotsAPI } from '@/api/slots';
import { queryKeys } from './queryKeys';
import type {
  AvailableSlot,
  CreateAvailableSlot,
  UpdateAvailableSlot,
  AvailableTime,
} from '@/api/types';

/**
 * Get available slots for a teacher
 */
export function useTeacherSlots(
  teacherId: number,
  options?: UseQueryOptions<AvailableSlot[], Error>,
) {
  return useQuery({
    queryKey: queryKeys.teacherSlots(teacherId),
    queryFn: () => slotsAPI.getTeacherSlots(teacherId),
    enabled: !!teacherId,
    ...options,
  });
}

/**
 * Get available days for a teacher
 */
export function useTeacherAvailableDays(
  teacherId: number,
  options?: UseQueryOptions<number[], Error>,
) {
  return useQuery({
    queryKey: [...queryKeys.teacherSlots(teacherId), 'days'],
    queryFn: () => slotsAPI.getAvailableDays(teacherId),
    enabled: !!teacherId,
    ...options,
  });
}

/**
 * Get available times for a teacher on a specific date
 */
export function useTeacherAvailableTimes(
  teacherId: number,
  date: string,
  options?: UseQueryOptions<AvailableTime[], Error>,
) {
  return useQuery({
    queryKey: [...queryKeys.teacherSlots(teacherId), 'times', date],
    queryFn: () => slotsAPI.getAvailableTimes(teacherId, date),
    enabled: !!teacherId && !!date,
    ...options,
  });
}

/**
 * Create a new available slot for a teacher
 */
export function useCreateSlotMutation(
  teacherId: number,
  options?: UseMutationOptions<AvailableSlot, Error, CreateAvailableSlot>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => slotsAPI.create(teacherId, data),
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
  options?: UseMutationOptions<AvailableSlot, Error, { slotId: number; data: UpdateAvailableSlot }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slotId, data }) => slotsAPI.update(teacherId, slotId, data),
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
  options?: UseMutationOptions<void, Error, number>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slotId) => slotsAPI.delete(teacherId, slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teacherSlots(teacherId),
      });
    },
    ...options,
  });
}

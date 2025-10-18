// Hooks for fetching and managing slots data

import { useQuery, useMutation } from '@tanstack/react-query'
import { slotsAPI } from '@/api'
import type { SmartSlotCreate, SmartSlotPreview } from '@/types/api'
import { toast } from 'sonner'

// Query keys
export const slotsKeys = {
  all: ['slots'] as const,
  list: (filters?: {
    teacher_id?: string
    date?: string
    week_start?: string
    available?: boolean
    skip?: number
    limit?: number
  }) => [...slotsKeys.all, 'list', filters] as const,
  detail: (id: string) => [...slotsKeys.all, 'detail', id] as const,
  schedule: (teacherId: string, weekStart?: string) => 
    [...slotsKeys.all, 'schedule', teacherId, weekStart] as const,
}

// Hook to fetch all slots with optional filters
export const useSlots = (filters?: {
  teacher_id?: string
  date?: string
  week_start?: string
  available?: boolean
  skip?: number
  limit?: number
}) => {
  return useQuery({
    queryKey: slotsKeys.list(filters),
    queryFn: () => slotsAPI.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook to fetch a single slot by ID
export const useSlotById = (slotId: string) => {
  return useQuery({
    queryKey: slotsKeys.detail(slotId),
    queryFn: () => slotsAPI.getById(slotId),
    staleTime: 2 * 60 * 1000,
    enabled: !!slotId,
  })
}

// Hook to fetch teacher's weekly schedule
export const useTeacherSchedule = (teacherId: string, weekStart?: string) => {
  return useQuery({
    queryKey: slotsKeys.schedule(teacherId, weekStart),
    queryFn: () => slotsAPI.getTeacherSchedule(teacherId, weekStart ? { week_start: weekStart } : undefined),
    staleTime: 2 * 60 * 1000,
    enabled: !!teacherId,
  })
}

// Hook to preview smart slots before creating
export const usePreviewSmartSlots = (options?: { onSuccess?: (data: SmartSlotPreview) => void }) => {
  return useMutation({
    mutationFn: async (data: SmartSlotCreate) => {
      return slotsAPI.previewSmartSlots(data)
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
    onError: () => {
      toast.error('Error previewing slots')
    },
  })
}

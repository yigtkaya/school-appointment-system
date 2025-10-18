// CRUD operation hooks for teachers, parents, and slots

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teachersAPI, parentsAPI, slotsAPI, notificationsAPI } from '@/api'
import type { TeacherCreate, ParentCreate, ParentUpdate, SlotCreate, SlotBulkCreate, SlotUpdate, SmartSlotCreate } from '@/types/api'
import { toast } from 'sonner'
import { teachersKeys } from './teachers'
import { parentsKeys } from './parents'
import { slotsKeys } from './slots'
import { notificationsKeys } from './notifications'

// ============================================================================
// TEACHER CRUD HOOKS
// ============================================================================

// Hook to create a new teacher
export const useCreateTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TeacherCreate) => teachersAPI.create(data),
    onSuccess: () => {
      toast.success('Teacher has been created.')
      queryClient.invalidateQueries({ queryKey: teachersKeys.all })
    },
    onError: () => {
      toast.error('Error creating teacher')
    },
  })
}

// Hook to update a teacher
export const useUpdateTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TeacherCreate> }) =>
      teachersAPI.update(id, data),
    onSuccess: (data) => {
      toast.success('Teacher has been updated.')
      queryClient.invalidateQueries({ queryKey: teachersKeys.all })
      queryClient.invalidateQueries({ queryKey: teachersKeys.detail(parseInt(data.id)) })
    },
    onError: () => {
      toast.error('Error updating teacher')
    },
  })
}

// Hook to delete a teacher
export const useDeleteTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (teacherId: number) => teachersAPI.delete(teacherId),
    onSuccess: () => {
      toast.success('Teacher has been deleted.')
      queryClient.invalidateQueries({ queryKey: teachersKeys.all })
    },
    onError: () => {
      toast.error('Error deleting teacher')
    },
  })
}

// ============================================================================
// PARENT CRUD HOOKS
// ============================================================================

// Hook to create a new parent
export const useCreateParent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ParentCreate) => parentsAPI.create(data),
    onSuccess: () => {
      toast.success('Parent has been created.')
      queryClient.invalidateQueries({ queryKey: parentsKeys.all })
    },
    onError: () => {
      toast.error('Error creating parent')
    },
  })
}

// Hook to update a parent
export const useUpdateParent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ parentId, data }: { parentId: string; data: ParentUpdate }) =>
      parentsAPI.update(parentId, data),
    onSuccess: (data) => {
      toast.success('Parent has been updated.')
      queryClient.invalidateQueries({ queryKey: parentsKeys.all })
      queryClient.invalidateQueries({ queryKey: parentsKeys.detail(data.id) })
    },
    onError: () => {
      toast.error('Error updating parent')
    },
  })
}

// Hook to delete a parent
export const useDeleteParent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (parentId: number) => parentsAPI.delete(parentId),
    onSuccess: () => {
      toast.success('Parent has been deleted.')
      queryClient.invalidateQueries({ queryKey: parentsKeys.all })
    },
    onError: () => {
      toast.error('Error deleting parent')
    },
  })
}

// ============================================================================
// SLOT CRUD HOOKS
// ============================================================================

// Hook to create a single available slot
export const useCreateSlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SlotCreate) => slotsAPI.create(data),
    onSuccess: () => {
      toast.success('Slot has been created.')
      queryClient.invalidateQueries({ queryKey: slotsKeys.all })
    },
    onError: () => {
      toast.error('Error creating slot')
    },
  })
}

// Hook to create multiple slots at once
export const useCreateBulkSlots = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SlotBulkCreate) => slotsAPI.createBulk(data),
    onSuccess: () => {
      toast.success('Slots have been created.')
      queryClient.invalidateQueries({ queryKey: slotsKeys.all })
    },
    onError: () => {
      toast.error('Error creating slots')
    },
  })
}

// Hook to create slots using smart slot algorithm
export const useCreateSmartSlots = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SmartSlotCreate) => slotsAPI.createSmartSlots(data),
    onSuccess: () => {
      toast.success('Smart slots have been created.')
      queryClient.invalidateQueries({ queryKey: slotsKeys.all })
      options?.onSuccess?.()
    },
    onError: () => {
      toast.error('Error creating smart slots')
    },
  })
}

// Hook to update a slot
export const useUpdateSlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slotId, data }: { slotId: string; data: SlotUpdate }) =>
      slotsAPI.update(slotId, data),
    onSuccess: (data) => {
      toast.success('Slot has been updated.')
      queryClient.invalidateQueries({ queryKey: slotsKeys.all })
      queryClient.invalidateQueries({ queryKey: slotsKeys.detail(data.id) })
    },
    onError: () => {
      toast.error('Error updating slot')
    },
  })
}

// Hook to delete an available slot
export const useDeleteSlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slotId: number) => slotsAPI.delete(slotId),
    onSuccess: () => {
      toast.success('Slot has been deleted.')
      queryClient.invalidateQueries({ queryKey: slotsKeys.all })
    },
    onError: () => {
      toast.error('Error deleting slot')
    },
  })
}

// ============================================================================
// NOTIFICATION CRUD HOOKS
// ============================================================================

// Hook to send a manual notification
export const useSendManualNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { recipient_email: string; subject: string; message: string; type?: string }) =>
      notificationsAPI.sendManual(data),
    onSuccess: () => {
      toast.success('Notification sent successfully.')
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all })
    },
    onError: () => {
      toast.error('Error sending notification')
    },
  })
}   

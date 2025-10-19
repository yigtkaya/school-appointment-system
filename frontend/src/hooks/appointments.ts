// Hooks for fetching and managing appointments data

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentsAPI } from '@/api'
import type { AppointmentStatus } from '@/types/api'
import { toast } from 'sonner'

// Query keys
export const appointmentsKeys = {
  all: ['appointments'] as const,
  list: (filters?: {
    status?: AppointmentStatus
    teacher_id?: string
    parent_id?: string
    start_date?: string
    end_date?: string
  }) => [...appointmentsKeys.all, 'list', filters] as const,
  detail: (id: string) => [...appointmentsKeys.all, 'detail', id] as const,
  parentAppointments: (parentId: string) => 
    [...appointmentsKeys.all, 'parent', parentId] as const,
  teacherAppointments: (teacherId: string) => 
    [...appointmentsKeys.all, 'teacher', teacherId] as const,
}

// Hook to fetch all appointments with optional filters
export const useAppointments = (filters?: {
  status?: AppointmentStatus
  teacher_id?: string
  parent_id?: string
  start_date?: string
  end_date?: string
}) => {
  return useQuery({
    queryKey: appointmentsKeys.list(filters),
    queryFn: () => appointmentsAPI.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook to fetch a single appointment by ID
export const useAppointmentById = (appointmentId: string) => {
  return useQuery({
    queryKey: appointmentsKeys.detail(appointmentId),
    queryFn: () => appointmentsAPI.getById(appointmentId),
    staleTime: 2 * 60 * 1000,
    enabled: !!appointmentId,
  })
}

// Hook to fetch all appointments for a specific parent
export const useParentAppointments = (parentId: string) => {
  return useQuery({
    queryKey: appointmentsKeys.parentAppointments(parentId),
    queryFn: () => appointmentsAPI.getParentAppointments(parentId),
    staleTime: 2 * 60 * 1000,
    enabled: !!parentId,
  })
}

// Hook to fetch all appointments for a specific teacher
export const useTeacherAppointments = (teacherId: string) => {
  return useQuery({
    queryKey: appointmentsKeys.teacherAppointments(teacherId),
    queryFn: () => appointmentsAPI.getTeacherAppointments(teacherId),
    staleTime: 2 * 60 * 1000,
    enabled: !!teacherId,
  })
}

// Hook to fetch pending appointments for a teacher (with real-time updates)
export const useTeacherPendingAppointments = (teacherId: string) => {
  return useQuery({
    queryKey: [...appointmentsKeys.teacherAppointments(teacherId), 'pending'] as const,
    queryFn: () => appointmentsAPI.getTeacherPendingAppointments(teacherId),
    enabled: !!teacherId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 10 * 1000, // 10 seconds
  })
}

// Hook to fetch today's appointments for a teacher
export const useTeacherTodaysAppointments = (teacherId: string) => {
  return useQuery({
    queryKey: [...appointmentsKeys.teacherAppointments(teacherId), 'today'] as const,
    queryFn: () => {
      const today = new Date().toISOString().split('T')[0]
      return appointmentsAPI.getTeacherAppointments(teacherId, {
        start_date: today,
        end_date: today,
      })
    },
    enabled: !!teacherId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Hook to update appointment status
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: AppointmentStatus }) => {
      return appointmentsAPI.updateStatus(appointmentId, status)
    },
    onSuccess: (data) => {
      toast.success('Appointment status updated')
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.all })
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.detail(data.id) })
    },
    onError: () => {
      toast.error('Error updating appointment status')
    },
  })
}

// Hook to cancel appointment
export const useCancelAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      return appointmentsAPI.cancel(appointmentId)
    },
    onSuccess: () => {
      toast.success('Appointment cancelled')
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.all })
    },
    onError: () => {
      toast.error('Error cancelling appointment')
    },
  })
}

// Hook to confirm an appointment (teacher action)
export const useConfirmAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (appointmentId: string) => appointmentsAPI.confirm(appointmentId),
    onSuccess: () => {
      toast.success('Appointment confirmed successfully!')
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.all })
    },
    onError: () => {
      toast.error('Failed to confirm appointment')
    },
  })
}

// Hook to reject an appointment (teacher action)
export const useRejectAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: string; reason: string }) =>
      appointmentsAPI.reject(appointmentId, reason),
    onSuccess: () => {
      toast.success('Appointment rejected')
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.all })
    },
    onError: () => {
      toast.error('Failed to reject appointment')
    },
  })
}

// Hooks for fetching and managing notifications data

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsAPI } from '@/api'
import { toast } from 'sonner'

// Query keys
export const notificationsKeys = {
  all: ['notifications'] as const,
  list: (filters?: {
    status?: 'pending' | 'sent' | 'failed'
    type?: 'confirmation' | 'cancellation' | 'reminder' | 'manual'
    recipient_email?: string
    skip?: number
    limit?: number
  }) => [...notificationsKeys.all, 'list', filters] as const,
  detail: (id: string) => [...notificationsKeys.all, 'detail', id] as const,
  stats: (params?: { date_from?: string; date_to?: string }) => 
    [...notificationsKeys.all, 'stats', params] as const,
}

// Hook to fetch all notifications with optional filters
export const useNotifications = (filters?: {
  status?: 'pending' | 'sent' | 'failed'
  type?: 'confirmation' | 'cancellation' | 'reminder' | 'manual'
  recipient_email?: string
  skip?: number
  limit?: number
}) => {
  return useQuery({
    queryKey: notificationsKeys.list(filters),
    queryFn: () => notificationsAPI.getAll(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Hook to fetch a single notification by ID
export const useNotificationById = (notificationId: string) => {
  return useQuery({
    queryKey: notificationsKeys.detail(notificationId),
    queryFn: () => notificationsAPI.getById(notificationId),
    staleTime: 1 * 60 * 1000,
    enabled: !!notificationId,
  })
}

// Hook to fetch notification statistics
export const useNotificationStats = (params?: { date_from?: string; date_to?: string }) => {
  return useQuery({
    queryKey: notificationsKeys.stats(params),
    queryFn: () => notificationsAPI.getStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to resend a failed notification
export const useResendNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return notificationsAPI.resend(notificationId)
    },
    onSuccess: (data) => {
      toast.success('Notification resent successfully')
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all })
      queryClient.invalidateQueries({ queryKey: notificationsKeys.detail(data.id) })
    },
    onError: () => {
      toast.error('Error resending notification')
    },
  })
}

// Hook to delete a notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return notificationsAPI.delete(notificationId)
    },
    onSuccess: () => {
      toast.success('Notification deleted')
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all })
    },
    onError: () => {
      toast.error('Error deleting notification')
    },
  })
}

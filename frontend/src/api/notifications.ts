import { apiClient } from './client'
import type { Notification } from '@/types/api'

export const notificationsAPI = {
  // Get all notifications (admin only)
  getAll: async (params?: {
    status?: 'pending' | 'sent' | 'failed'
    type?: 'confirmation' | 'cancellation' | 'reminder' | 'manual'
    recipient_email?: string
    skip?: number
    limit?: number
  }): Promise<Notification[]> => {
    const response = await apiClient.get<{
      notifications: Notification[];
      total: number;
      skip: number;
      limit: number;
    }>('/notifications', params)
    return response.notifications
  },

  // Get notification by ID
  getById: async (notificationId: string): Promise<Notification> => {
    return apiClient.get(`/notifications/${notificationId}`)
  },

  // Manually send notification (admin only)
  sendManual: async (data: {
    recipient_email: string
    subject: string
    message: string
    type?: string
  }): Promise<Notification> => {
    return apiClient.post('/notifications/send', data)
  },

  // Resend failed notification (admin only)
  resend: async (notificationId: string): Promise<Notification> => {
    return apiClient.post(`/notifications/${notificationId}/resend`)
  },

  // Delete notification (admin only)
  delete: async (notificationId: string): Promise<void> => {
    return apiClient.delete(`/notifications/${notificationId}`)
  },

  // Get notification statistics (admin only)
  getStats: async (params?: {
    date_from?: string
    date_to?: string
  }): Promise<{
    total: number
    sent: number
    failed: number
    pending: number
    by_type: Record<string, number>
    by_status: Record<string, number>
  }> => {
    return apiClient.get('/notifications/stats', params)
  },
}
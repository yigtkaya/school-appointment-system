import { apiClient } from './client'
import type { DailySchedule, MonthlyCalendar, WeeklySchedule, TimeSlotSuggestion, BulkSlotAdvanced, AvailableSlot } from '@/types/api'

export const calendarAPI = {
  // Get daily schedule
  getDailySchedule: async (date: string, params?: {
    teacher_id?: string
  }): Promise<DailySchedule> => {
    return apiClient.get(`/calendar/daily/${date}`, params)
  },

  // Get monthly calendar view
  getMonthlyCalendar: async (year: number, month: number, params?: {
    teacher_id?: string
  }): Promise<MonthlyCalendar> => {
    return apiClient.get(`/calendar/monthly/${year}/${month}`, params)
  },

  // Get enhanced weekly schedule
  getEnhancedWeekly: async (teacherId: string, params?: {
    week_start?: string
  }): Promise<WeeklySchedule> => {
    return apiClient.get(`/calendar/enhanced-weekly/${teacherId}`, params)
  },

  // Get time slot suggestions
  getSuggestions: async (date: string, params?: {
    teacher_id?: string
    duration_minutes?: number
  }): Promise<TimeSlotSuggestion[]> => {
    return apiClient.get(`/calendar/suggestions/${date}`, params)
  },

  // Export appointments as iCal
  exportIcal: async (params?: {
    teacher_id?: string
    parent_id?: string
    start_date?: string
    end_date?: string
  }): Promise<Blob> => {
    const response = await fetch(`${apiClient['baseURL']}/calendar/export/ical?${new URLSearchParams(params)}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    })
    return response.blob()
  },

  // Advanced bulk slot creation with patterns
  createBulkAdvanced: async (data: BulkSlotAdvanced): Promise<{
    created_slots: AvailableSlot[]
    summary: {
      total_created: number
      total_skipped: number
      conflicts: string[]
    }
  }> => {
    return apiClient.post('/calendar/bulk-advanced', data)
  },
}
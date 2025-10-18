import { apiClient } from './client'
import type { Slot, SlotCreate, SlotUpdate, SlotBulkCreate, SlotListResponse, SmartSlotCreate, SmartSlotPreview, Teacher } from '@/types/api'

export const slotsAPI = {
  // Get all available slots with filters
  getAll: async (params?: {
    teacher_id?: string
    date?: string
    week_start?: string
    available?: boolean
    skip?: number
    limit?: number
  }): Promise<SlotListResponse> => {
    return apiClient.get('/slots', params)
  },

  // Create single slot (admin/teacher)
  create: async (data: SlotCreate): Promise<Slot> => {
    return apiClient.post('/slots', data)
  },

  // Create multiple slots at once
  createBulk: async (data: SlotBulkCreate): Promise<Slot[]> => {
    return apiClient.post('/slots/bulk', data)
  },

  // Get slot by ID
  getById: async (slotId: string): Promise<Slot> => {
    return apiClient.get(`/slots/${slotId}`)
  },

  // Update slot
  update: async (slotId: string, data: SlotUpdate): Promise<Slot> => {
    return apiClient.put(`/slots/${slotId}`, data)
  },

  // Delete slot (if not booked)
  delete: async (slotId: number): Promise<void> => {
    return apiClient.delete(`/slots/${slotId}`)
  },

  // Get teacher's weekly schedule
  getTeacherSchedule: async (teacherId: string, params?: {
    week_start?: string
  }): Promise<{
    teacher: Teacher
    schedule: Record<string, Slot[]>
    week_start: string
    week_end: string
  }> => {
    return apiClient.get(`/slots/teacher/${teacherId}/schedule`, params)
  },

  // Smart slot creation - preview slots before creating
  previewSmartSlots: async (data: SmartSlotCreate): Promise<SmartSlotPreview> => {
    return apiClient.post('/slots/smart-preview', data)
  },

  // Smart slot creation - create slots intelligently
  createSmartSlots: async (data: SmartSlotCreate): Promise<Slot[]> => {
    return apiClient.post('/slots/smart-create', data)
  },
}
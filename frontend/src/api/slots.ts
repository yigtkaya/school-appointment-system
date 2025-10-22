import type { AvailableSlot, CreateAvailableSlot, UpdateAvailableSlot, AvailableTime } from "@/api/types"
import { apiClient } from "./client"

export const slotsAPI = {
  // Get teacher slots (public)
  async getTeacherSlots(teacherId: number): Promise<AvailableSlot[]> {
    return apiClient.get<AvailableSlot[]>(`/api/teachers/${teacherId}/slots`)
  },

  // Get available days for a teacher
  async getAvailableDays(teacherId: number): Promise<number[]> {
    return apiClient.get<number[]>(`/api/teachers/${teacherId}/available-days`)
  },

  // Get available times for a specific date
  async getAvailableTimes(teacherId: number, date: string): Promise<AvailableTime[]> {
    return apiClient.get<AvailableTime[]>(`/api/teachers/${teacherId}/available-times?date=${date}`)
  },

  // Teacher endpoints (authenticated)
  async create(teacherId: number, data: CreateAvailableSlot): Promise<AvailableSlot> {
    return apiClient.post<AvailableSlot>(`/api/teachers/${teacherId}/slots`, data)
  },

  async update(teacherId: number, slotId: number, data: UpdateAvailableSlot): Promise<AvailableSlot> {
    return apiClient.put<AvailableSlot>(`/api/teachers/${teacherId}/slots/${slotId}`, data)
  },

  async delete(teacherId: number, slotId: number): Promise<void> {
    return apiClient.delete<void>(`/api/teachers/${teacherId}/slots/${slotId}`)
  }
}
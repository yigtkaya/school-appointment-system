import type { AvailableSlot, CreateAvailableSlot, UpdateAvailableSlot, AvailableTime } from "@/api/types"
import { apiClient } from "./client"

export const slotsAPI = {
  // Get teacher slots (public)
  async getTeacherSlots(teacherId: number): Promise<AvailableSlot[]> {
    return apiClient.get<AvailableSlot[]>(`/api/teachers/${teacherId}/slots`)
  },

  // Get available dates for a teacher
  async getAvailableDates(teacherId: number): Promise<string[]> {
    return apiClient.get<string[]>(`/api/teachers/${teacherId}/available-dates`)
  },

  // Get available times for a specific date
  async getAvailableTimes(teacherId: number, date: string): Promise<AvailableTime[]> {
    return apiClient.get<AvailableTime[]>(`/api/teachers/${teacherId}/available-times?date_str=${date}`)
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
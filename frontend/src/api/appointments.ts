import type { Appointment, CreateAppointment, UpdateAppointment, AppointmentStats } from "@/api/types"
import { apiClient } from "./client"

export const appointmentsAPI = {
  // Admin endpoints
  async getAllAppointments(params?: { status?: string; teacher_id?: number; class_id?: number }): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>('/api/admin/appointments', params)
  },

  async getAppointmentById(id: number): Promise<Appointment> {
    return apiClient.get<Appointment>(`/api/admin/appointments/${id}`)
  },

  async getAppointmentStats(): Promise<AppointmentStats> {
    return apiClient.get<AppointmentStats>('/api/admin/appointments/stats')
  },

  // Teacher endpoints
  async getTeacherAppointments(teacherId: number): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>(`/api/appointments/teachers/${teacherId}/appointments`)
  },

  // Public appointment creation
  async create(data: CreateAppointment): Promise<Appointment> {
    return apiClient.post<Appointment>('/api/appointments', data)
  },

  // Teacher/Admin appointment updates
  async updateStatus(id: number, data: UpdateAppointment): Promise<Appointment> {
    return apiClient.patch<Appointment>(`/api/appointments/${id}`, data)
  },

  async cancel(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/appointments/${id}`)
  }
}
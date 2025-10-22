import type { AppointmentStats } from "@/api/types"
import { apiClient } from "./client"

export const adminAppointmentsAPI = {
  // Get all appointments with optional filters
  async getAllAppointments(params?: {
    status?: string
    teacher_id?: number
    class_id?: number
  }): Promise<any[]> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.teacher_id) queryParams.append('teacher_id', String(params.teacher_id))
    if (params?.class_id) queryParams.append('class_id', String(params.class_id))
    
    const url = `/api/admin/appointments${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    return apiClient.get<any[]>(url)
  },

  // Get appointment statistics
  async getStats(): Promise<AppointmentStats> {
    return apiClient.get<AppointmentStats>('/api/admin/appointments/stats')
  },

  // Get specific appointment details
  async getAppointmentById(id: number): Promise<any> {
    return apiClient.get<any>(`/api/admin/appointments/${id}`)
  },
}

import { apiClient } from './client'
import type { 
  Appointment, 
  AppointmentCreate, 
  AppointmentStatus 
} from '@/types/api'

export const appointmentsAPI = {
  async getAll(params?: { 
    status?: AppointmentStatus;
    teacher_id?: string;
    parent_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Appointment[]> {
    const response = await apiClient.get<{
      appointments: Appointment[];
      total: number;
      skip: number;
      limit: number;
    }>('/appointments', params)
    return response.appointments
  },

  async getById(id: string): Promise<Appointment> {
    return apiClient.get<Appointment>(`/appointments/${id}`)
  },

  async book(data: AppointmentCreate): Promise<Appointment> {
    return apiClient.post<Appointment>('/appointments/book', data)
  },

  async update(id: string, data: Partial<AppointmentCreate>): Promise<Appointment> {
    return apiClient.put<Appointment>(`/appointments/${id}`, data)
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    return apiClient.put<Appointment>(`/appointments/${id}/status`, { status })
  },

  async confirm(id: string): Promise<Appointment> {
    return apiClient.put<Appointment>(`/appointments/${id}/confirm`)
  },

  async reject(id: string, reason: string): Promise<Appointment> {
    return apiClient.put<Appointment>(`/appointments/${id}/reject?rejection_reason=${encodeURIComponent(reason)}`)
  },

  async cancel(id: string): Promise<void> {
    return apiClient.delete(`/appointments/${id}`)
  },

  async getParentAppointments(parentId: string): Promise<Appointment[]> {
    const response = await apiClient.get<{
      appointments: Appointment[];
      summary: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
      };
    }>(`/appointments/parent/${parentId}/appointments`)
    return response.appointments
  },

  async getTeacherAppointments(teacherId: string, params?: {
    status?: string;
    pending_only?: boolean;
    start_date?: string;
    end_date?: string;
  }): Promise<Appointment[]> {
    const response = await apiClient.get<{
      appointments: Appointment[];
      summary: {
        total: number;
        pending_appointments: number;
        confirmed_appointments: number;
        completed_appointments: number;
        cancelled_appointments: number;
      };
    }>(`/appointments/teacher/${teacherId}/appointments`, params)
    return response.appointments
  },

  async getTeacherPendingAppointments(teacherId: string): Promise<Appointment[]> {
    return this.getTeacherAppointments(teacherId, { pending_only: true })
  }
}
import { apiClient } from './client'
import type { Teacher, TeacherCreate } from '@/types/api'

export const teachersAPI = {
  async getAll(params?: { subject?: string; branch?: string }): Promise<Teacher[]> {
    return apiClient.get<Teacher[]>('/teachers', params)
  },

  async getById(id: string): Promise<Teacher> {
    return apiClient.get<Teacher>(`/teachers/${id}`)
  },

  async create(data: TeacherCreate): Promise<Teacher> {
    return apiClient.post<Teacher>('/teachers', data)
  },

  async update(id: string, data: Partial<TeacherCreate>): Promise<Teacher> {
    return apiClient.put<Teacher>(`/teachers/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/teachers/${id}`)
  },

  async getByUserId(userId: string): Promise<Teacher> {
    return apiClient.get<Teacher>(`/teachers/user/${userId}`)
  }
}
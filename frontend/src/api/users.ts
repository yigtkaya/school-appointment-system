import type { User, CreateUser, UpdateUser } from "@/api/types"
import { apiClient } from "./client"

export const usersAPI = {
  // Admin teacher management
  async getTeachers(): Promise<User[]> {
    return apiClient.get<User[]>('/api/admin/teachers')
  },

  async getTeacherById(id: number): Promise<User> {
    return apiClient.get<User>(`/api/admin/teachers/${id}`)
  },

  async createTeacher(data: CreateUser): Promise<User> {
    return apiClient.post<User>('/api/admin/teachers', data)
  },

  async updateTeacher(id: number, data: UpdateUser): Promise<User> {
    return apiClient.put<User>(`/api/admin/teachers/${id}`, data)
  },

  async deleteTeacher(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/admin/teachers/${id}`)
  },

  async approveTeacher(id: number): Promise<User> {
    return apiClient.post<User>(`/api/admin/teachers/${id}/approve`)
  },

  async requireApproval(id: number): Promise<User> {
    return apiClient.post<User>(`/api/admin/teachers/${id}/require-approval`)
  }
}
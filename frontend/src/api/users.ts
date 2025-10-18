import { apiClient } from './client'
import type { UserCreate, User } from '@/types/api'

export const usersAPI = {
  async create(data: UserCreate): Promise<User> {
    return apiClient.post<User>('/admin/users', data)
  },

  async getAll(): Promise<User[]> {
    return apiClient.get<User[]>('/admin/users')
  },

  async getById(id: string): Promise<User> {
    return apiClient.get<User>(`/admin/users/${id}`)
  },

  async update(id: string, data: Partial<UserCreate>): Promise<User> {
    return apiClient.put<User>(`/admin/users/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/admin/users/${id}`)
  },
}
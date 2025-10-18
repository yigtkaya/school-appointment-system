import { apiClient } from './client'
import type { Parent, ParentCreate, ParentUpdate } from '@/types/api'

export const parentsAPI = {
  // Get all parents (admin/teacher only)
  getAll: async (params?: {
    student_class?: string
    grade?: string
    skip?: number
    limit?: number
  }): Promise<Parent[]> => {
    const response = await apiClient.get<{
      parents: Parent[];
      total: number;
      skip: number;
      limit: number;
    }>('/parents', params)
    return response.parents
  },

  // Create parent (admin only)
  create: async (data: ParentCreate): Promise<Parent> => {
    return apiClient.post('/parents', data)
  },

  // Get current user's parent profile
  getMe: async (): Promise<Parent> => {
    return apiClient.get('/parents/me')
  },

  // Get parent by ID
  getById: async (parentId: string): Promise<Parent> => {
    return apiClient.get(`/parents/${parentId}`)
  },

  // Update parent
  update: async (parentId: string, data: ParentUpdate): Promise<Parent> => {
    return apiClient.put(`/parents/${parentId}`, data)
  },

  // Delete parent (admin only)
  delete: async (parentId: string): Promise<void> => {
    return apiClient.delete(`/parents/${parentId}`)
  },

  // Get parent by user ID
  getByUserId: async (userId: string): Promise<Parent> => {
    return apiClient.get(`/parents/user/${userId}`)
  },
}
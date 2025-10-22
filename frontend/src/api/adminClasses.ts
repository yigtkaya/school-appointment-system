import type { Class, CreateClass, UpdateClass } from "@/api/types"
import { apiClient } from "./client"

export const adminClassesAPI = {
  // List all classes
  async getClasses(): Promise<Class[]> {
    return apiClient.get<Class[]>('/api/admin/classes')
  },

  // Get a specific class
  async getClassById(id: number): Promise<Class> {
    return apiClient.get<Class>(`/api/admin/classes/${id}`)
  },

  // Create a new class
  async createClass(data: CreateClass): Promise<Class> {
    return apiClient.post<Class>('/api/admin/classes', data)
  },

  // Update a class
  async updateClass(id: number, data: UpdateClass): Promise<Class> {
    return apiClient.put<Class>(`/api/admin/classes/${id}`, data)
  },

  // Delete a class
  async deleteClass(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/admin/classes/${id}`)
  },
}

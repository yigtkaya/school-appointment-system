import type { Student, CreateStudent, UpdateStudent } from "@/api/types"
import { apiClient } from "./client"

export const studentsAPI = {
  // Public endpoint - get student by ID
  async getById(id: number): Promise<Student> {
    return apiClient.get<Student>(`/api/students/${id}`)
  },

  // Get students in a specific class
  async getByClass(classId: number): Promise<Student[]> {
    return apiClient.get<Student[]>(`/api/classes/${classId}/students`)
  },

  // Admin endpoints
  async create(data: CreateStudent): Promise<Student> {
    return apiClient.post<Student>('/api/students', data)
  },

  async adminCreate(data: CreateStudent): Promise<Student> {
    return apiClient.post<Student>('/api/admin/students', data)
  },

  async adminUpdate(id: number, data: UpdateStudent): Promise<Student> {
    return apiClient.put<Student>(`/api/admin/students/${id}`, data)
  },

  async adminDelete(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/admin/students/${id}`)
  }
}
import type { Student, CreateStudent, UpdateStudent } from "@/api/types"
import { apiClient } from "./client"

export const adminStudentsAPI = {
  // Create a new student
  async createStudent(data: CreateStudent): Promise<Student> {
    return apiClient.post<Student>('/api/admin/students', data)
  },

  // Update a student
  async updateStudent(id: number, data: UpdateStudent): Promise<Student> {
    return apiClient.put<Student>(`/api/admin/students/${id}`, data)
  },

  // Delete a student
  async deleteStudent(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/admin/students/${id}`)
  },
}

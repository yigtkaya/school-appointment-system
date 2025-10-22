import type { Class, CreateClass, UpdateClass, User, TeacherClassAssignment } from "@/api/types"
import { apiClient } from "./client"

export const classesAPI = {
  // Public endpoints
  async getAll(): Promise<Class[]> {
    return apiClient.get<Class[]>('/api/classes')
  },

  async getById(id: number): Promise<Class> {
    return apiClient.get<Class>(`/api/classes/${id}`)
  },

  async getTeachers(classId: number): Promise<User[]> {
    return apiClient.get<User[]>(`/api/classes/${classId}/teachers`)
  },

  // Admin endpoints
  async create(data: CreateClass): Promise<Class> {
    return apiClient.post<Class>('/api/classes', data)
  },

  async adminCreate(data: CreateClass): Promise<Class> {
    return apiClient.post<Class>('/api/admin/classes', data)
  },

  async adminUpdate(id: number, data: UpdateClass): Promise<Class> {
    return apiClient.put<Class>(`/api/admin/classes/${id}`, data)
  },

  async adminDelete(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/admin/classes/${id}`)
  },

  // Teacher-Class relationships
  async assignTeacher(teacherId: number, classId: number): Promise<TeacherClassAssignment> {
    return apiClient.post<TeacherClassAssignment>('/api/teacher-classes', { teacher_id: teacherId, class_id: classId })
  }
}
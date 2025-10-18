// Hooks for fetching and managing teachers data

import { useQuery } from '@tanstack/react-query'
import { teachersAPI } from '@/api'

// Query keys
export const teachersKeys = {
  all: ['teachers'] as const,
  list: (filters?: { subject?: string; branch?: string }) => 
    [...teachersKeys.all, 'list', filters] as const,
  detail: (id: number) => [...teachersKeys.all, 'detail', id] as const,
  byUserId: (userId: number) => [...teachersKeys.all, 'byUserId', userId] as const,
}

// Hook to fetch all teachers with optional filters
export const useTeachers = (filters?: { subject?: string; branch?: string }) => {
  return useQuery({
    queryKey: teachersKeys.list(filters),
    queryFn: () => teachersAPI.getAll(filters),
    staleTime: 5 * 600 * 1000, // 10 minutes
  })
}

// Hook to fetch a single teacher by ID
export const useTeacherById = (id: number) => {
  return useQuery({
    queryKey: teachersKeys.detail(id),
    queryFn: () => teachersAPI.getById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

// Hook to fetch a teacher by user ID
export const useTeacherByUserId = (userId: number) => {
  return useQuery({
    queryKey: teachersKeys.byUserId(userId),
    queryFn: () => teachersAPI.getByUserId(userId),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  })
}

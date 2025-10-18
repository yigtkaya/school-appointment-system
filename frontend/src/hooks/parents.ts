// Hooks for fetching and managing parents data

import { useQuery } from '@tanstack/react-query'
import { parentsAPI } from '@/api'

// Query keys
export const parentsKeys = {
  all: ['parents'] as const,
  list: (filters?: { 
    student_class?: string
    grade?: string
    skip?: number
    limit?: number 
  }) => [...parentsKeys.all, 'list', filters] as const,
  detail: (id: string) => [...parentsKeys.all, 'detail', id] as const,
  me: ['parents', 'me'] as const,
  byUserId: (userId: string) => [...parentsKeys.all, 'byUserId', userId] as const,
}

// Hook to fetch all parents with optional filters
export const useParents = (filters?: { 
  student_class?: string
  grade?: string
  skip?: number
  limit?: number 
}) => {
  return useQuery({
    queryKey: parentsKeys.list(filters),
    queryFn: () => parentsAPI.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to fetch current user's parent profile
export const useParentMe = () => {
  return useQuery({
    queryKey: parentsKeys.me,
    queryFn: () => parentsAPI.getMe(),
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch a single parent by ID
export const useParentById = (parentId: string) => {
  return useQuery({
    queryKey: parentsKeys.detail(parentId),
    queryFn: () => parentsAPI.getById(parentId),
    staleTime: 5 * 60 * 1000,
    enabled: !!parentId,
  })
}

// Hook to fetch a parent by user ID
export const useParentByUserId = (userId: string) => {
  return useQuery({
    queryKey: parentsKeys.byUserId(userId),
    queryFn: () => parentsAPI.getByUserId(userId),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  })
}

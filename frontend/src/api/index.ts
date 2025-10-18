// Export all API modules
export { apiClient } from './client'
export { authAPI } from './auth'
export { teachersAPI } from './teachers'
export { appointmentsAPI } from './appointments'
export { parentsAPI } from './parents'
export { slotsAPI } from './slots'
export { calendarAPI } from './calendar'
export { notificationsAPI } from './notifications'

// Re-export types
export type * from '@/types/api'
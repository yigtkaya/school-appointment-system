/**
 * Application configuration
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_ME: '/api/auth/me',
  AUTH_PROFILE: '/api/auth/me',

  // Classes
  CLASSES: '/api/classes',
  CLASSES_LIST: '/api/classes',
  CLASSES_BY_ID: (id: number) => `/api/classes/${id}`,
  CLASS_STUDENTS: (id: number) => `/api/classes/${id}/students`,
  CLASS_TEACHERS: (id: number) => `/api/classes/${id}/teachers`,

  // Students
  STUDENTS: '/api/students',
  STUDENTS_BY_ID: (id: number) => `/api/students/${id}`,

  // Teacher Slots
  TEACHER_SLOTS: (id: number) => `/api/teachers/${id}/slots`,
  TEACHER_SLOTS_LIST: '/api/teachers/:teacherId/slots',
  TEACHER_SLOTS_CREATE: '/api/teachers/:teacherId/slots',
  TEACHER_SLOTS_UPDATE: '/api/teachers/:teacherId/slots',
  TEACHER_SLOT_BY_ID: (teacherId: number, slotId: number) => `/api/teachers/${teacherId}/slots/${slotId}`,
  TEACHER_AVAILABLE_DAYS: (id: number) => `/api/teachers/${id}/available-days`,
  TEACHER_AVAILABLE_TIMES: (id: number, date: string) => `/api/teachers/${id}/available-times?date=${date}`,

  // Appointments
  APPOINTMENTS: '/api/appointments',
  APPOINTMENTS_CREATE: '/api/appointments',
  APPOINTMENTS_BY_ID: (id: number) => `/api/appointments/${id}`,
  TEACHER_APPOINTMENTS: (id: number) => `/api/appointments/teachers/${id}/appointments`,
  TEACHER_APPOINTMENTS_LIST: '/api/appointments/teachers/:teacherId/appointments',

  // Admin
  ADMIN_USERS: '/api/admin/users',
  ADMIN_TEACHERS: '/api/admin/teachers',
  ADMIN_TEACHERS_BY_ID: (id: number) => `/api/admin/teachers/${id}`,
  ADMIN_TEACHERS_APPROVE: (id: number) => `/api/admin/teachers/${id}/approve`,
  ADMIN_CLASSES: '/api/admin/classes',
  ADMIN_CLASSES_CREATE: '/api/admin/classes',
  ADMIN_CLASSES_UPDATE: '/api/admin/classes',
  ADMIN_CLASSES_BY_ID: (id: number) => `/api/admin/classes/${id}`,
  ADMIN_STUDENTS: '/api/admin/students',
  ADMIN_STUDENTS_LIST: '/api/admin/students',
  ADMIN_STUDENTS_CREATE: '/api/admin/students',
  ADMIN_STUDENTS_UPDATE: '/api/admin/students',
  ADMIN_STUDENTS_BY_ID: (id: number) => `/api/admin/students/${id}`,
  ADMIN_APPOINTMENTS: '/api/admin/appointments',
  ADMIN_APPOINTMENTS_LIST: '/api/admin/appointments',
  ADMIN_APPOINTMENTS_UPDATE: '/api/admin/appointments',
  ADMIN_APPOINTMENTS_DELETE: '/api/admin/appointments',
  ADMIN_APPOINTMENTS_STATS: '/api/admin/appointments/stats',
  ADMIN_APPOINTMENTS_BY_ID: (id: number) => `/api/admin/appointments/${id}`,
};

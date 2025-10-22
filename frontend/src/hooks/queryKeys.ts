/**
 * Centralized query key factory for TanStack Query
 * Ensures consistent cache management across the app
 */

export const queryKeys = {
  all: ['api'] as const,

  // Auth
  auth: () => [...queryKeys.all, 'auth'] as const,

  // Users
  users: () => [...queryKeys.all, 'users'] as const,
  user: (id: number) => [...queryKeys.users(), id] as const,

  // Classes
  classes: () => [...queryKeys.all, 'classes'] as const,
  class: (id: number) => [...queryKeys.classes(), id] as const,

  // Students
  students: () => [...queryKeys.all, 'students'] as const,
  student: (id: number) => [...queryKeys.students(), id] as const,

  // Slots
  slots: () => [...queryKeys.all, 'slots'] as const,
  teacherSlots: (teacherId: number) =>
    [...queryKeys.slots(), 'teacher', teacherId] as const,

  // Appointments
  appointments: (params?: any) => params 
    ? [...queryKeys.all, 'appointments', params] as const
    : [...queryKeys.all, 'appointments'] as const,
  appointment: (id: number) => [...queryKeys.all, 'appointments', id] as const,
  appointmentStats: () => [...queryKeys.all, 'appointments', 'stats'] as const,
  teacherAppointments: (teacherId: number) =>
    [...queryKeys.all, 'appointments', 'teacher', teacherId] as const,

  // Admin
  admin: () => [...queryKeys.all, 'admin'] as const,
  adminClasses: () => [...queryKeys.admin(), 'classes'] as const,
  adminStudents: () => [...queryKeys.admin(), 'students'] as const,
  adminAppointments: (params?: any) => params 
    ? [...queryKeys.admin(), 'appointments', params] as const
    : [...queryKeys.admin(), 'appointments'] as const,
  adminStats: () => [...queryKeys.admin(), 'stats'] as const,
};

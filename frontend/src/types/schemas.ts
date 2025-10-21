import { z } from 'zod';

/**
 * Authentication Schemas - matches backend /api/auth endpoints
 */
export const RegisterSchema = z.object({
  name: z.string().min(2, 'First name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  branch: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
});

/**
 * User Schemas - matches backend User model
 * 
 * Backend fields:
 * - id, name, email, password_hash, branch, role, require_approval, created_at
 */
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  branch: z.string().nullable().optional(),
  role: z.enum(['admin', 'teacher']),
  require_approval: z.number(), // Backend uses integer (0/1) instead of boolean
  created_at: z.string().datetime(),
});

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  branch: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  branch: z.string().optional(),
});

/**
 * Class Schemas - matches backend Class model
 * 
 * Backend fields:
 * - id, grade (1-12), section (A-D)
 */
export const ClassSchema = z.object({
  id: z.number(),
  grade: z.number().min(1).max(12),
  section: z.string().min(1).max(1),
});

export const CreateClassSchema = z.object({
  grade: z.number().min(1).max(12),
  section: z.string().min(1).max(1),
});

export const UpdateClassSchema = z.object({
  grade: z.number().min(1).max(12).optional(),
  section: z.string().min(1).max(1).optional(),
});

/**
 * Student Schemas - matches backend Student model
 * 
 * Backend fields:
 * - id, name, class_id
 */
export const StudentSchema = z.object({
  id: z.number(),
  name: z.string(),
  class_id: z.number(),
});

export const CreateStudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  class_id: z.number().positive('Class ID is required'),
});

export const UpdateStudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  class_id: z.number().positive('Class ID is required').optional(),
});

/**
 * Available Slot Schemas - matches backend AvailableSlot model
 * 
 * Backend fields:
 * - id, teacher_id, day_of_week (0-6), date (optional), start_time, end_time, timezone, is_active, created_at
 */
export const AvailableSlotSchema = z.object({
  id: z.number(),
  teacher_id: z.number(),
  day_of_week: z.number().min(0).max(6), // 0=Monday, 6=Sunday
  date: z.string().datetime().nullable().optional(),
  start_time: z.string(), // "HH:MM:SS"
  end_time: z.string(), // "HH:MM:SS"
  timezone: z.string().default('UTC'),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
});

export const CreateAvailableSlotSchema = z.object({
  teacher_id: z.number().optional(), // Not needed in request, uses auth
  day_of_week: z.number().min(0).max(6),
  date: z.string().datetime().optional(),
  start_time: z.string(), // "HH:MM:SS" or "HH:MM"
  end_time: z.string(), // "HH:MM:SS" or "HH:MM"
  timezone: z.string().default('UTC').optional(),
  is_active: z.boolean().default(true).optional(),
});

export const UpdateAvailableSlotSchema = z.object({
  day_of_week: z.number().min(0).max(6).optional(),
  date: z.string().datetime().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  timezone: z.string().optional(),
  is_active: z.boolean().optional(),
});

/**
 * Appointment Schemas - matches backend Appointment model
 * 
 * Backend fields:
 * - id, teacher_id, class_id, student_id, appointment_start, appointment_end, 
 *   parent_name, parent_email, parent_phone, note, status, created_at
 * 
 * Status: "pending" | "confirmed" | "cancelled" | "rejected"
 */
export const AppointmentSchema = z.object({
  id: z.number(),
  teacher_id: z.number(),
  class_id: z.number(),
  student_id: z.number(),
  appointment_start: z.string().datetime(),
  appointment_end: z.string().datetime(),
  parent_name: z.string(),
  parent_email: z.string().email(),
  parent_phone: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'rejected']),
  created_at: z.string().datetime(),
});

export const CreateAppointmentSchema = z.object({
  teacher_id: z.number().positive(),
  class_id: z.number().positive(),
  student_id: z.number().positive(),
  appointment_start: z.string().datetime(),
  appointment_end: z.string().datetime(),
  parent_name: z.string().min(2, 'Parent name required'),
  parent_email: z.string().email('Invalid email'),
  parent_phone: z.string().optional(),
  note: z.string().optional(),
});

export const UpdateAppointmentSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'rejected']).optional(),
});

/**
 * Filter/Query Schemas
 */
export const AppointmentFilterSchema = z.object({
  teacher_id: z.number().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'rejected']).optional(),
});

export const ClassFilterSchema = z.object({
  grade: z.number().min(1).max(12).optional(),
  section: z.string().optional(),
});

/**
 * Type exports for use throughout the app
 */
export type Register = z.infer<typeof RegisterSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type Class = z.infer<typeof ClassSchema>;
export type CreateClass = z.infer<typeof CreateClassSchema>;
export type UpdateClass = z.infer<typeof UpdateClassSchema>;
export type Student = z.infer<typeof StudentSchema>;
export type CreateStudent = z.infer<typeof CreateStudentSchema>;
export type UpdateStudent = z.infer<typeof UpdateStudentSchema>;
export type AvailableSlot = z.infer<typeof AvailableSlotSchema>;
export type CreateAvailableSlot = z.infer<typeof CreateAvailableSlotSchema>;
export type UpdateAvailableSlot = z.infer<typeof UpdateAvailableSlotSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointment = z.infer<typeof UpdateAppointmentSchema>;
export type AppointmentFilter = z.infer<typeof AppointmentFilterSchema>;
export type ClassFilter = z.infer<typeof ClassFilterSchema>;

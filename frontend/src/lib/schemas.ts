import { UserRole } from '@/api/types';
import { z } from 'zod';

// Auth schemas
export const LoginSchema = z.object({
  username_or_email: z.string()
    .min(1, 'Username or email is required')
    .refine(
      (value) => {
        // Allow either a valid email or a username (alphanumeric with dots, hyphens, underscores)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        return emailRegex.test(value) || usernameRegex.test(value);
      },
      'Enter a valid username (e.g., ozge.cavlak) or email address'
    ),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  branch: z.string().optional(),
  role: z.enum([UserRole.Admin, UserRole.Teacher]).default(UserRole.Teacher),
});

// Class schemas
export const ClassSchema = z.object({
  grade: z.number().min(1).max(12),
  section: z.string().min(1).max(1),
});

// Student schemas
export const StudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  class_id: z.number().positive('Class ID must be positive'),
});

// Slot schemas
export const AvailableSlotSchema = z.object({
  date: z.string().date('Invalid date format'),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid time format'),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid time format'),
  timezone: z.string().default('UTC'),
  is_active: z.boolean().default(true),
});

// Appointment schemas
export const AppointmentSchema = z.object({
  class_id: z.number().positive(),
  student_id: z.number().positive(),
  teacher_id: z.number().positive(),
  appointment_start: z.string().datetime(),
  appointment_end: z.string().datetime(),
  parent_name: z.string().min(2, 'Parent name must be at least 2 characters'),
  parent_email: z.string().email('Invalid email address'),
  parent_phone: z.string().optional(),
  note: z.string().optional(),
});

// Type exports for inference
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ClassInput = z.infer<typeof ClassSchema>;
export type StudentInput = z.infer<typeof StudentSchema>;
export type AvailableSlotInput = z.infer<typeof AvailableSlotSchema>;
export type AppointmentInput = z.infer<typeof AppointmentSchema>;

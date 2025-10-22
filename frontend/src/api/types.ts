/**
 * Authentication Types
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  branch?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * User Types
 */
export interface User {
  id: number;
  name: string;
  email: string;
  branch?: string | null;
  role: UserRole;
  require_approval: number;
  created_at: string;
}

export enum UserRole {
  Admin = 'admin',
  Teacher = 'teacher',
}

export interface CreateUser {
  name: string;
  email: string;
  password: string;
  branch?: string;
}

export interface UpdateUser {
  name?: string;
  branch?: string;
}

/**
 * Class Types
 */
export interface Class {
  id: number;
  grade: number;
  section: string;
}

export interface CreateClass {
  grade: number;
  section: string;
}

export interface UpdateClass {
  grade?: number;
  section?: string;
}

/**
 * Student Types
 */
export interface Student {
  id: number;
  name: string;
  class_id: number;
}

export interface CreateStudent {
  name: string;
  class_id: number;
}

export interface UpdateStudent {
  name?: string;
  class_id?: number;
}

/**
 * Available Slot Types
 */
export interface AvailableSlot {
  id: number;
  teacher_id: number;
  day_of_week: number;
  date?: string | null;
  start_time: string;
  end_time: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateAvailableSlot {
  teacher_id?: number;
  day_of_week: number;
  date?: string;
  start_time: string;
  end_time: string;
  timezone?: string;
  is_active?: boolean;
}

export interface UpdateAvailableSlot {
  day_of_week?: number;
  date?: string;
  start_time?: string;
  end_time?: string;
  timezone?: string;
  is_active?: boolean;
}

/**
 * Appointment Types
 */
export interface Appointment {
  id: number;
  teacher_id: number;
  class_id: number;
  student_id: number;
  appointment_start: string;
  appointment_end: string;
  parent_name: string;
  parent_email: string;
  parent_phone?: string | null;
  note?: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  created_at: string;
}

export interface CreateAppointment {
  teacher_id: number;
  class_id: number;
  student_id: number;
  appointment_start: string;
  appointment_end: string;
  parent_name: string;
  parent_email: string;
  parent_phone?: string;
  note?: string;
}

export interface UpdateAppointment {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
}

/**
 * Filter/Query Types
 */
export interface AppointmentFilter {
  teacher_id?: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
}

export interface ClassFilter {
  grade?: number;
  section?: string;
}

/**
 * Stats/Analytics Types
 */
export interface AppointmentStats {
  total_appointments: number;
  pending_appointments: number;
  confirmed_appointments: number;
  cancelled_appointments: number;
  rejected_appointments: number;
  total_teachers: number;
  total_classes: number;
  total_students: number;
}

export interface AvailableTime {
  id: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface TeacherClassAssignment {
  teacher_id: number;
  class_id: number;
}

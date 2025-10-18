// API Response Types based on backend schemas

export enum UserRole {
  ADMIN = "admin",
  TEACHER = "teacher", 
  PARENT = "parent"
}

export enum AppointmentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed"
}

export enum MeetingMode {
  ONLINE = "online",
  FACE_TO_FACE = "face_to_face"
}

// User Types
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name?: string;
  role: UserRole;
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

// Teacher Types
export interface Teacher {
  id: string;
  user_id: string;
  subject: string;
  branch: string | null;
  bio: string | null;
  user: User;
  available_slots?: AvailableSlot[];
  created_at: string;
  updated_at: string;
}

export interface TeacherCreate {
  user_id: string;
  subject: string;
  branch?: string;
  bio?: string;
}

// Parent Types
export interface Parent {
  id: string;
  user_id: string;
  student_name: string;
  student_class: string;
  phone_number: string | null;
  user: User;
  appointments?: Appointment[];
  created_at: string;
  updated_at: string;
}

export interface ParentCreate {
  user_id: string;
  student_name: string;
  student_class: string;
  phone_number?: string;
}

export interface ParentUpdate {
  student_name?: string;
  student_class?: string;
  phone_number?: string;
}

// Slot Types
export interface AvailableSlot {
  id: string;
  teacher_id: string;
  day_of_week: number; // 0=Monday, 6=Sunday
  start_time: string;
  end_time: string;
  is_booked: boolean;
  week_start_date: string;
  teacher?: Teacher;
  appointment?: Appointment;
  created_at: string;
  updated_at: string;
}

export interface SlotCreate {
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  week_start_date: string;
}

export interface SlotUpdate {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  week_start_date?: string;
}

export interface SlotBulkCreate {
  teacher_id: string;
  slots: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
  week_start_date: string;
}

export type Slot = AvailableSlot;

export interface SlotListResponse {
  slots: AvailableSlot[];
  total: number;
  skip: number;
  limit: number;
}

// Appointment Types
export interface Appointment {
  id: string;
  parent_id: string;
  teacher_id: string;
  slot_id: string;
  meeting_mode: MeetingMode;
  status: AppointmentStatus;
  notes: string | null;
  parent: Parent;
  teacher: Teacher;
  slot: AvailableSlot;
  created_at: string;
  updated_at: string;
}

export interface AppointmentCreate {
  parent_id: string;
  teacher_id: string;
  slot_id: string;
  meeting_mode: MeetingMode;
  notes?: string;
}

// API Error Types
export interface APIError {
  detail: string | { [key: string]: string };
}

export interface ValidationError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'appointment' | 'slot';
  status?: AppointmentStatus;
  meeting_mode?: MeetingMode;
}

export interface DailySchedule {
  date: string;
  slots: AvailableSlot[];
  appointments: Appointment[];
  teacher?: Teacher;
  summary: {
    total_slots: number;
    available_slots: number;
    booked_slots: number;
    total_appointments: number;
  };
}

export interface MonthlyCalendar {
  year: number;
  month: number;
  weeks: Array<{
    week_start: string;
    week_end: string;
    days: Array<{
      date: string;
      slots_count: number;
      appointments_count: number;
      available_slots: number;
    }>;
  }>;
  summary: {
    total_slots: number;
    total_appointments: number;
    available_slots: number;
  };
}

export interface WeeklySchedule {
  teacher: Teacher;
  week_start: string;
  week_end: string;
  schedule: Record<string, AvailableSlot[]>;
  statistics: {
    total_slots: number;
    available_slots: number;
    booked_slots: number;
    total_appointments: number;
    busiest_day: string;
    utilization_rate: number;
  };
}

export interface TimeSlotSuggestion {
  suggested_time: string;
  end_time: string;
  duration_minutes: number;
  confidence_score: number;
  reason: string;
}

export interface BulkSlotAdvanced {
  teacher_id: string;
  pattern: {
    days_of_week: number[];
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
    break_duration_minutes?: number;
  };
  date_range: {
    start_date: string;
    end_date: string;
  };
  exclusions?: {
    dates?: string[];
    time_ranges?: Array<{
      start_time: string;
      end_time: string;
    }>;
  };
}

// Smart Slot Types
export interface SmartSlotCreate {
  teacher_id: string;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  meeting_duration_minutes: number;
  week_start_date: string;
}

export interface SmartSlotPreview {
  total_slots: number;
  slots_per_day: number;
  meeting_duration_minutes: number;
  days: string[];
  time_range: string;
  total_hours: number;
  preview_slots: Array<{
    day_of_week: number;
    day_name: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
  }>;
}

// Notification Types
export interface Notification {
  id: string;
  recipient_email: string;
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  type: 'confirmation' | 'cancellation' | 'reminder' | 'manual';
  appointment_id?: string;
  error_message?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

// Health Check Types
export interface HealthCheck {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}
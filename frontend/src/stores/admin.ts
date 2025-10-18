import { create } from 'zustand'
import type { AvailableSlot } from '@/types/api'

// ============================================================================
// ADMIN UI STATE
// ============================================================================

interface AdminUIState {
  showSmartSlotCreateForm: boolean
  editingSlot: AvailableSlot | null
}

interface AdminUIActions {
  setShowSmartSlotCreateForm: (show: boolean) => void
  setEditingSlot: (slot: AvailableSlot | null) => void
}

export type AdminUIStore = AdminUIState & AdminUIActions

export const useAdminUIStore = create<AdminUIStore>((set) => ({
  // Initial state
  showSmartSlotCreateForm: false,
  editingSlot: null,

  // Actions
  setShowSmartSlotCreateForm: (show: boolean) => {
    set({ showSmartSlotCreateForm: show })
  },

  setEditingSlot: (slot: AvailableSlot | null) => {
    set({ editingSlot: slot })
  },
}))

// ============================================================================
// SCHEDULE FILTER STATE
// ============================================================================

interface ScheduleFilterState {
  selectedTeacher: string
  viewMode: 'calendar' | 'list'
  currentWeek: Date
}

interface ScheduleFilterActions {
  setSelectedTeacher: (teacherId: string) => void
  setViewMode: (mode: 'calendar' | 'list') => void
  setCurrentWeek: (date: Date) => void
  navigateWeek: (direction: 'prev' | 'next') => void
  goToToday: () => void
}

export type ScheduleFilterStore = ScheduleFilterState & ScheduleFilterActions

export const useScheduleFilterStore = create<ScheduleFilterStore>((set) => ({
  // Initial state
  selectedTeacher: '',
  viewMode: 'list',
  currentWeek: new Date(),

  // Actions
  setSelectedTeacher: (teacherId: string) => {
    set({ selectedTeacher: teacherId })
  },

  setViewMode: (mode: 'calendar' | 'list') => {
    set({ viewMode: mode })
  },

  setCurrentWeek: (date: Date) => {
    set({ currentWeek: date })
  },

  navigateWeek: (direction: 'prev' | 'next') => {
    set((state) => {
      const newDate = new Date(state.currentWeek)
      const daysToMove = direction === 'next' ? 7 : -7
      newDate.setDate(newDate.getDate() + daysToMove)
      return { currentWeek: newDate }
    })
  },

  goToToday: () => {
    set({ currentWeek: new Date() })
  },
}))

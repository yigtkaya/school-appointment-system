import { create } from 'zustand'
import type { AvailableSlot, MeetingMode, Teacher } from '@/types/api'

type BookingStep = 'child_info' | 'teacher' | 'slot' | 'mode' | 'notes' | 'confirm'

interface AppointmentBookingState {
  // Modal state
  isOpen: boolean
  currentStep: BookingStep
  
  // Form data
  selectedTeacher: Teacher | null
  selectedSlot: AvailableSlot | null
  selectedMode: MeetingMode | null
  notes: string
  
  // UI state
  bookingError: string | null
  isLoading: boolean
}

interface AppointmentBookingActions {
  // Modal management
  openModal: (teacherId?: string, preselectedSlot?: AvailableSlot) => void
  closeModal: () => void
  resetModal: () => void
  
  // Step navigation
  setCurrentStep: (step: BookingStep) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  
  // Form data updates
  setSelectedTeacher: (teacher: Teacher | null) => void
  setSelectedSlot: (slot: AvailableSlot | null) => void
  setSelectedMode: (mode: MeetingMode | null) => void
  setNotes: (notes: string) => void
  
  // UI state updates
  setBookingError: (error: string | null) => void
  setIsLoading: (loading: boolean) => void
}

export type AppointmentBookingStore = AppointmentBookingState & AppointmentBookingActions

const BOOKING_STEPS: BookingStep[] = ['child_info', 'teacher', 'slot', 'mode', 'notes', 'confirm']

export const useAppointmentBookingStore = create<AppointmentBookingStore>((set, get) => ({
  // Initial state
  isOpen: false,
  currentStep: 'child_info',
  selectedTeacher: null,
  selectedSlot: null,
  selectedMode: null,
  notes: '',
  bookingError: null,
  isLoading: false,

  // Modal management actions
  openModal: (_teacherId?: string, preselectedSlot?: AvailableSlot) => {
    set({
      isOpen: true,
      currentStep: 'child_info',
      selectedSlot: preselectedSlot || null,
      bookingError: null,
    })
  },

  closeModal: () => {
    set({ isOpen: false })
  },

  resetModal: () => {
    set({
      currentStep: 'child_info',
      selectedTeacher: null,
      selectedSlot: null,
      selectedMode: null,
      notes: '',
      bookingError: null,
      isLoading: false,
    })
  },

  // Step navigation actions
  setCurrentStep: (step: BookingStep) => {
    set({ currentStep: step })
  },

  goToNextStep: () => {
    const state = get()
    const currentIndex = BOOKING_STEPS.indexOf(state.currentStep)
    if (currentIndex < BOOKING_STEPS.length - 1) {
      set({ currentStep: BOOKING_STEPS[currentIndex + 1] })
    }
  },

  goToPreviousStep: () => {
    const state = get()
    const currentIndex = BOOKING_STEPS.indexOf(state.currentStep)
    if (currentIndex > 0) {
      set({ currentStep: BOOKING_STEPS[currentIndex - 1] })
    }
  },

  // Form data actions
  setSelectedTeacher: (teacher: Teacher | null) => {
    set({ selectedTeacher: teacher })
  },

  setSelectedSlot: (slot: AvailableSlot | null) => {
    set({ selectedSlot: slot })
  },

  setSelectedMode: (mode: MeetingMode | null) => {
    set({ selectedMode: mode })
  },

  setNotes: (notes: string) => {
    set({ notes })
  },

  // UI state actions
  setBookingError: (error: string | null) => {
    set({ bookingError: error })
  },

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
}))

// Selectors
export const useBookingStep = () => useAppointmentBookingStore((state) => state.currentStep)
export const useSelectedTeacher = () => useAppointmentBookingStore((state) => state.selectedTeacher)
export const useSelectedSlot = () => useAppointmentBookingStore((state) => state.selectedSlot)
export const useSelectedMode = () => useAppointmentBookingStore((state) => state.selectedMode)
export const useBookingNotes = () => useAppointmentBookingStore((state) => state.notes)
export const useBookingError = () => useAppointmentBookingStore((state) => state.bookingError)
export const useBookingIsLoading = () => useAppointmentBookingStore((state) => state.isLoading)
export const useBookingModalOpen = () => useAppointmentBookingStore((state) => state.isOpen)

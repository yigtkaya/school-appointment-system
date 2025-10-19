import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SlotSelector } from './SlotSelector'
import { MeetingModeSelector } from './MeetingModeSelector'
import { BookingConfirmation } from './BookingConfirmation'
import { TeacherSelector } from './TeacherSelector'
import { NotesInput } from './NotesInput'
import { appointmentsAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useAppointmentBookingStore } from '@/stores/appointmentBooking'
import { useTeachers, useTeacherById, useParentByUserId } from '@/hooks'
import type { 
  AvailableSlot, 
  AppointmentCreate 
} from '@/types/api'

const notesSchema = z.object({
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
})

type NotesFormData = z.infer<typeof notesSchema>

interface AppointmentBookingModalProps {
  isOpen: boolean
  onClose: () => void
  teacherId?: string
  preselectedSlot?: AvailableSlot
}

type BookingStep = 'teacher' | 'slot' | 'mode' | 'notes' | 'confirm'

const STEP_TITLES = {
  teacher: 'Select Teacher',
  slot: 'Choose Time Slot',
  mode: 'Meeting Format',
  notes: 'Additional Notes',
  confirm: 'Confirm Booking'
}

const STEP_PROGRESS = {
  teacher: 20,
  slot: 40,
  mode: 60,
  notes: 80,
  confirm: 100
}

export function AppointmentBookingModal({ 
  isOpen, 
  onClose, 
  teacherId, 
  preselectedSlot 
}: AppointmentBookingModalProps) {
  const { user } = useAuthStore()
  const {
    currentStep,
    selectedTeacher,
    selectedSlot,
    selectedMode,
    bookingError,
    setCurrentStep,
    setSelectedTeacher,
    setSelectedSlot,
    setSelectedMode,
    setBookingError,
  } = useAppointmentBookingStore()
  const queryClient = useQueryClient()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<NotesFormData>({
    resolver: zodResolver(notesSchema),
    defaultValues: { notes: '' }
  })

  const notes = watch('notes')

  // Data hooks
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers()
  const { data: teacher } = useTeacherById(teacherId || '')
  const { data: parentProfile } = useParentByUserId(user?.id || '')

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentCreate) => {
      return appointmentsAPI.book(data)
    },
    onSuccess: () => {
      toast.success('Appointment booked successfully!')
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-schedule'] })
      onClose()
      // Reset all modal state
      setCurrentStep('teacher')
      setSelectedTeacher(null)
      setSelectedSlot(null)
      setSelectedMode(null)
      setBookingError(null)
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { detail?: string } } }
      const errorMessage = apiError?.response?.data?.detail || 'Failed to book appointment'
      setBookingError(errorMessage)
      toast.error(errorMessage)
    }
  })

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (teacherId && teacher) {
        setSelectedTeacher(teacher)
        setCurrentStep(preselectedSlot ? 'mode' : 'slot')
      } else if (teacherId) {
        setCurrentStep('slot')
      } else {
        setCurrentStep('teacher')
      }
      setBookingError(null)
    }
  }, [isOpen, teacherId, teacher, preselectedSlot, setCurrentStep, setSelectedTeacher, setBookingError])

  const handleNext = () => {
    const steps: BookingStep[] = ['teacher', 'slot', 'mode', 'notes', 'confirm']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps: BookingStep[] = ['teacher', 'slot', 'mode', 'notes', 'confirm']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleConfirmBooking = handleSubmit(async (formData) => {
    if (!selectedTeacher || !selectedSlot || !selectedMode || !parentProfile) {
      toast.error('Please complete all required fields')
      return
    }

    const bookingData: AppointmentCreate = {
      parent_id: parentProfile.id,
      teacher_id: selectedTeacher.id,
      slot_id: selectedSlot.id,
      meeting_mode: selectedMode,
      notes: formData.notes || undefined
    }

    bookAppointmentMutation.mutate(bookingData)
  })

  const canProceed = () => {
    switch (currentStep) {
      case 'teacher':
        return !!selectedTeacher
      case 'slot':
        return !!selectedSlot
      case 'mode':
        return !!selectedMode
      case 'notes':
        return true // Notes are optional
      case 'confirm':
        return true
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'teacher':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select a Teacher</h3>
            <TeacherSelector
              teachers={teachers}
              isLoading={loadingTeachers}
              selectedTeacher={selectedTeacher}
              onTeacherSelect={setSelectedTeacher}
            />
          </div>
        )

      case 'slot':
        return selectedTeacher ? (
          <SlotSelector
            teacherId={selectedTeacher.id}
            selectedSlot={selectedSlot}
            onSlotSelect={setSelectedSlot}
          />
        ) : null

      case 'mode':
        return (
          <MeetingModeSelector
            selectedMode={selectedMode}
            onModeSelect={setSelectedMode}
          />
        )

      case 'notes':
        return (
          <NotesInput
            register={register('notes')}
            error={errors.notes}
            value={notes}
          />
        )

      case 'confirm':
        return selectedTeacher && selectedSlot && selectedMode ? (
          <BookingConfirmation
            teacher={selectedTeacher}
            slot={selectedSlot}
            meetingMode={selectedMode}
            notes={notes}
            parent={parentProfile}
            onConfirm={handleConfirmBooking}
            onEdit={() => setCurrentStep('notes')}
            isLoading={bookAppointmentMutation.isPending}
            error={bookingError}
          />
        ) : null

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book an Appointment</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>{STEP_TITLES[currentStep]}</span>
            <span>Step {Object.keys(STEP_TITLES).indexOf(currentStep) + 1} of {Object.keys(STEP_TITLES).length}</span>
          </div>
          <Progress value={STEP_PROGRESS[currentStep]} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="min-h-96">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'confirm' && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 'teacher'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
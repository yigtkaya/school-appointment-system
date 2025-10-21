import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
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
import { ChildInfoForm } from './ChildInfoForm'
import { appointmentsAPI } from '@/api'
import { useAppointmentBookingStore } from '@/stores/appointmentBooking'
import { useTeachers, useTeacherById } from '@/hooks'
import type {
  AvailableSlot,
  AppointmentBookingRequest
} from '@/types/api'

type BookingFormData = {
  child_name: string
  child_year: string
  child_class: string
  parent_contact?: string
  notes?: string
}

interface AppointmentBookingModalProps {
  isOpen: boolean
  onClose: () => void
  teacherId?: string
  preselectedSlot?: AvailableSlot
}

type BookingStep = 'child_info' | 'teacher' | 'slot' | 'mode' | 'notes' | 'confirm'


const STEP_PROGRESS = {
  child_info: 16,
  teacher: 33,
  slot: 50,
  mode: 66,
  notes: 83,
  confirm: 100
}

export function AppointmentBookingModal({
  isOpen,
  onClose,
  teacherId}: AppointmentBookingModalProps) {
  const { t } = useTranslation()
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

  const STEP_TITLES = {
    child_info: t('appointments.childInfo'),
    teacher: t('appointments.selectTeacher'),
    slot: t('appointments.selectSlot'),
    mode: t('appointments.meetingMode'),
    notes: t('appointments.notes'),
    confirm: t('appointments.confirm')
  }
  const queryClient = useQueryClient()

  const bookingFormSchema = z.object({
    child_name: z.string().min(1, t('appointments.form.validation.childNameRequired')).max(200, t('appointments.form.validation.nameIsTooLong')),
    child_year: z.string().regex(/^[1-8]$/, t('appointments.form.validation.selectValidYear')),
    child_class: z.string().regex(/^[A-E]$/, t('appointments.form.validation.selectValidClass')),
    parent_contact: z.string().max(200, t('appointments.form.validation.contactIsTooLong')).optional(),
    notes: z.string().max(500, t('appointments.form.validation.notesTooLong')).optional()
  })

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      child_name: '',
      child_year: '',
      child_class: '',
      parent_contact: '',
      notes: ''
    }
  })

  const formValues = watch()

  // Data hooks
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers()
  const { data: teacher } = useTeacherById(teacherId || '')

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentBookingRequest) => {
      return appointmentsAPI.book(data)
    },
    onSuccess: () => {
      toast.success(t('appointments.errors.appointmentBookedSuccessfully'))
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
      const errorMessage = apiError?.response?.data?.detail || t('appointments.errors.bookingFailed')
      setBookingError(errorMessage)
      toast.error(errorMessage)
    }
  })

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Always start with child info form
      setCurrentStep('child_info')
      setBookingError(null)

      // Pre-select teacher if provided
      if (teacherId && teacher) {
        setSelectedTeacher(teacher)
      }
    }
  }, [isOpen, teacherId, teacher, setCurrentStep, setSelectedTeacher, setBookingError])

  const handleNext = () => {
    const steps: BookingStep[] = ['child_info', 'teacher', 'slot', 'mode', 'notes', 'confirm']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps: BookingStep[] = ['child_info', 'teacher', 'slot', 'mode', 'notes', 'confirm']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleConfirmBooking = handleSubmit(async (formData) => {
    if (!selectedTeacher || !selectedSlot || !selectedMode) {
      toast.error(t('appointments.errors.completeAllFields'))
      return
    }

    const bookingData: AppointmentBookingRequest = {
      slot_id: selectedSlot.id,
      meeting_mode: selectedMode,
      notes: formData.notes || undefined,
      child_name: formData.child_name,
      child_year: formData.child_year,
      child_class: formData.child_class,
      parent_contact: formData.parent_contact || undefined,
    }

    bookAppointmentMutation.mutate(bookingData)
  })

  const canProceed = () => {
    switch (currentStep) {
      case 'child_info':
        return !!(formValues.child_name && formValues.child_year && formValues.child_class)
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
      case 'child_info':
        return (
          <ChildInfoForm
            register={register}
            errors={errors}
            values={formValues}
          />
        )

      case 'teacher':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('appointments.modal.selectTeacher')}</h3>
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
            value={formValues.notes}
          />
        )

      case 'confirm':
        return selectedTeacher && selectedSlot && selectedMode ? (
          <BookingConfirmation
            teacher={selectedTeacher}
            slot={selectedSlot}
            meetingMode={selectedMode}
            notes={formValues.notes}
            childInfo={{
              child_name: formValues.child_name,
              child_year: formValues.child_year,
              child_class: formValues.child_class,
              parent_contact: formValues.parent_contact
            }}
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
          <DialogTitle>{t('appointments.modal.bookAppointment')}</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>{STEP_TITLES[currentStep]}</span>
            <span>{t('appointments.modal.stepOf', { current: Object.keys(STEP_TITLES).indexOf(currentStep) + 1, total: Object.keys(STEP_TITLES).length })}</span>
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
              disabled={currentStep === 'child_info'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('appointments.modal.back')}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {t('appointments.modal.next')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
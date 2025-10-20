import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { type SmartSlotPreview } from '@/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTeachers, usePreviewSmartSlots, useCreateSmartSlots, useTeacherByUserId } from '@/hooks'
import { useAuthStore, useIsTeacher } from '@/stores/auth'

const smartSlotSchema = z.object({
  teacher_id: z.string().min(1, 'Please select a teacher'),
  days_of_week: z.array(z.number()).min(1, 'Please select at least one day'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  meeting_duration_minutes: z.number().min(15).max(120),
  week_start_date: z.string().min(1, 'Week start date is required'),
}).refine(
  (data) => data.start_time < data.end_time,
  {
    message: "End time must be after start time",
    path: ["end_time"],
  }
)

type SmartSlotFormData = z.infer<typeof smartSlotSchema>

interface SmartSlotCreateFormProps {
  onClose: () => void
  onSuccess: () => void
}

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const commonDurations = [15, 30, 45, 60, 90, 120]

// Get the next Monday from today
const getNextMonday = (): string => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  const nextMonday = new Date(today)
  nextMonday.setDate(today.getDate() + daysUntilMonday)
  return nextMonday.toISOString().split('T')[0]
}

export function SmartSlotCreateForm({ onSuccess }: SmartSlotCreateFormProps) {
  const [preview, setPreview] = useState<SmartSlotPreview | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SmartSlotFormData>({
    resolver: zodResolver(smartSlotSchema),
    defaultValues: {
      days_of_week: [],
      meeting_duration_minutes: 30,
      week_start_date: getNextMonday(),
    },
  })

  const watchedValues = watch()

  // Get user info
  const { user } = useAuthStore()
  const isTeacher = useIsTeacher()
  const { data: teachers } = useTeachers()
  const { data: currentTeacherData } = useTeacherByUserId(user?.id || '')

  // Preview and create mutations
  const previewMutation = usePreviewSmartSlots({
    onSuccess: (data) => {
      setPreview(data)
      setShowPreview(true)
    },
  })

  const createMutation = useCreateSmartSlots({
    onSuccess: onSuccess,
  })

  // If user is a teacher, they can only create slots for themselves
  const isTeacherUser = isTeacher && currentTeacherData?.id

  const handleDayToggle = (dayIndex: number) => {
    const currentDays = watchedValues.days_of_week || []
    const newDays = currentDays.includes(dayIndex)
      ? currentDays.filter(d => d !== dayIndex)
      : [...currentDays, dayIndex].sort()
    setValue('days_of_week', newDays)
  }

  const handlePreview = (data: SmartSlotFormData) => {
    previewMutation.mutate(data)
  }

  const handleCreate = () => {
    if (preview) {
      createMutation.mutate({
        teacher_id: watchedValues.teacher_id,
        days_of_week: watchedValues.days_of_week,
        start_time: watchedValues.start_time,
        end_time: watchedValues.end_time,
        meeting_duration_minutes: watchedValues.meeting_duration_minutes,
        week_start_date: watchedValues.week_start_date,
      })
    }
  }

  const selectedTeacher = teachers?.find(t => t.id === watchedValues.teacher_id)

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div>
          <form onSubmit={handleSubmit(handlePreview)} className="space-y-5">
            {/* Teacher Selection */}
            <div>
              <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 mb-2">
                Teacher
              </label>
              {isTeacherUser ? (
                <div className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-sm flex items-center">
                  <span className="text-gray-700">{currentTeacherData?.user?.full_name} — {currentTeacherData?.subject}</span>
                  <input
                    {...register('teacher_id')}
                    type="hidden"
                    value={currentTeacherData?.id}
                  />
                </div>
              ) : (
                <select
                  {...register('teacher_id')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="">Select a teacher</option>
                  {teachers?.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.full_name} — {teacher.subject}
                    </option>
                  ))}
                </select>
              )}
              {errors.teacher_id && (
                <p className="mt-1 text-sm text-red-500">{errors.teacher_id.message}</p>
              )}
            </div>

            {/* Week Start Date */}
            <div>
              <label htmlFor="week_start_date" className="block text-sm font-medium text-gray-700 mb-2">
                Week Start Date
              </label>
              <input
                {...register('week_start_date')}
                type="date"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              />
              {errors.week_start_date && (
                <p className="mt-1 text-sm text-red-500">{errors.week_start_date.message}</p>
              )}
            </div>

            {/* Days Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Days
              </label>
              <div className="grid grid-cols-2 gap-2">
                {dayNames.map((day, index) => (
                  <label
                    key={index}
                    className={`
                      flex items-center justify-center p-2.5 rounded-md border cursor-pointer transition-colors text-sm font-medium
                      ${watchedValues.days_of_week?.includes(index)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={watchedValues.days_of_week?.includes(index) || false}
                      onChange={() => handleDayToggle(index)}
                      className="sr-only"
                    />
                    {day}
                  </label>
                ))}
              </div>
              {errors.days_of_week && (
                <p className="mt-1 text-sm text-red-500">{errors.days_of_week.message}</p>
              )}
            </div>

            {/* Time Block */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  {...register('start_time')}
                  type="time"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                />
                {errors.start_time && (
                  <p className="mt-1 text-sm text-red-500">{errors.start_time.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  {...register('end_time')}
                  type="time"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                />
                {errors.end_time && (
                  <p className="mt-1 text-sm text-red-500">{errors.end_time.message}</p>
                )}
              </div>
            </div>

            {/* Meeting Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Duration (minutes)
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {commonDurations.map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setValue('meeting_duration_minutes', duration)}
                    className={`
                      px-3 py-2 text-sm rounded-md border transition-colors font-medium
                      ${watchedValues.meeting_duration_minutes === duration
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {duration}m
                  </button>
                ))}
              </div>
              <input
                {...register('meeting_duration_minutes', { valueAsNumber: true })}
                type="number"
                min="15"
                max="120"
                step="5"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              />
              {errors.meeting_duration_minutes && (
                <p className="mt-1 text-sm text-red-500">{errors.meeting_duration_minutes.message}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                disabled={previewMutation.isPending}
                className="w-full"
              >
                {previewMutation.isPending ? 'Generating Preview...' : 'Preview Slots'}
              </Button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div>
          {showPreview && preview ? (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Slot Preview</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">{preview.total_slots}</div>
                  <div className="text-xs text-gray-600 mt-1">Total Slots</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{preview.slots_per_day}</div>
                  <div className="text-xs text-gray-600 mt-1">Per Day</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Time Range: </span>
                  <span className="font-medium text-gray-900">{preview.time_range}</span>
                </div>
                <div>
                  <span className="text-gray-600">Duration: </span>
                  <span className="font-medium text-gray-900">{preview.meeting_duration_minutes} min meetings</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Days:</div>
                <div className="flex flex-wrap gap-1">
                  {preview.days.map((day) => (
                    <Badge key={day} variant="secondary" className="text-xs">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedTeacher && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Teacher</div>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedTeacher.user.full_name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {selectedTeacher.subject}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Slots'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                  className="flex-1"
                >
                  Edit
                </Button>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-3 text-3xl">✨</div>
              <h3 className="font-semibold text-gray-700 mb-1">Smart Slot Creation</h3>
              <p className="text-sm text-gray-600">
                Fill in the form and click "Preview Slots" to see what will be created
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
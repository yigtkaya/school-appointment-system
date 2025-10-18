import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { type SmartSlotPreview } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Calendar, Clock, Users, Sparkles } from 'lucide-react'
import { useTeachers, usePreviewSmartSlots, useCreateSmartSlots } from '@/hooks'

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

export function SmartSlotCreateForm({ onClose, onSuccess }: SmartSlotCreateFormProps) {
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

  // Get all teachers
  const { data: teachers } = useTeachers()

  // Preview mutation with callback to update local preview state
  const previewMutation = usePreviewSmartSlots({
    onSuccess: (data) => {
      setPreview(data)
      setShowPreview(true)
    },
  })

  // Create mutation with callback
  const createMutation = useCreateSmartSlots({
    onSuccess: onSuccess,
  })

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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <CardTitle>Smart Slot Creator</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Intelligently create multiple time slots by defining availability blocks
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit(handlePreview)} className="space-y-4">
              {/* Teacher Selection */}
              <div>
                <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher *
                </label>
                <select
                  {...register('teacher_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a teacher</option>
                  {teachers?.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.full_name} - {teacher.subject}
                    </option>
                  ))}
                </select>
                {errors.teacher_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.teacher_id.message}</p>
                )}
              </div>

              {/* Week Start Date */}
              <div>
                <label htmlFor="week_start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Week Start Date (Monday) *
                </label>
                <input
                  {...register('week_start_date')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.week_start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.week_start_date.message}</p>
                )}
              </div>

              {/* Days Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Days *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dayNames.map((day, index) => (
                    <label
                      key={index}
                      className={`
                        flex items-center justify-center p-3 rounded-md border cursor-pointer transition-colors
                        ${watchedValues.days_of_week?.includes(index)
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={watchedValues.days_of_week?.includes(index) || false}
                        onChange={() => handleDayToggle(index)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{day}</span>
                    </label>
                  ))}
                </div>
                {errors.days_of_week && (
                  <p className="mt-1 text-sm text-red-600">{errors.days_of_week.message}</p>
                )}
              </div>

              {/* Time Block */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    {...register('start_time')}
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.start_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    {...register('end_time')}
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.end_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
                  )}
                </div>
              </div>

              {/* Meeting Duration */}
              <div>
                <label htmlFor="meeting_duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Duration (minutes) *
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {commonDurations.map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setValue('meeting_duration_minutes', duration)}
                      className={`
                        px-3 py-2 text-sm rounded-md border transition-colors
                        ${watchedValues.meeting_duration_minutes === duration
                          ? 'bg-blue-500 text-white border-blue-500'
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.meeting_duration_minutes && (
                  <p className="mt-1 text-sm text-red-600">{errors.meeting_duration_minutes.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  type="submit"
                  disabled={previewMutation.isPending}
                  className="flex-1"
                >
                  {previewMutation.isPending ? 'Generating Preview...' : 'Preview Slots'}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            {showPreview && preview && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Slot Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">{preview.total_slots}</div>
                      <div className="text-sm text-gray-600">Total Slots</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">{preview.slots_per_day}</div>
                      <div className="text-sm text-gray-600">Per Day</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{preview.time_range}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{preview.meeting_duration_minutes} min meetings</span>
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
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700">Teacher:</div>
                      <div className="text-sm text-gray-600">
                        {selectedTeacher.user.full_name} - {selectedTeacher.subject}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-2">
                    <Button
                      onClick={handleCreate}
                      disabled={createMutation.isPending}
                      className="flex-1"
                    >
                      {createMutation.isPending ? 'Creating Slots...' : 'Create Slots'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(false)}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!showPreview && (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Smart Slot Creation</h3>
                  <p className="text-gray-600">
                    Fill in the form and click "Preview Slots" to see what will be created
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
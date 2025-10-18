import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { slotsAPI } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { Teacher } from '@/types/api'

const createSlotSchema = z.object({
  teacher_id: z.string().min(1, 'Teacher is required'),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  week_start_date: z.string().min(1, 'Week start date is required'),
}).refine(
  (data) => data.start_time < data.end_time,
  {
    message: "End time must be after start time",
    path: ["end_time"],
  }
)

type CreateSlotFormData = z.infer<typeof createSlotSchema>

interface SlotCreateFormProps {
  teachers: Teacher[]
  onClose: () => void
  onSuccess: () => void
}

export function SlotCreateForm({ teachers, onClose, onSuccess }: SlotCreateFormProps) {
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<CreateSlotFormData>({
    resolver: zodResolver(createSlotSchema),
    defaultValues: {
      day_of_week: 0,
      week_start_date: getNextMonday(),
    },
  })

  const createSlotMutation = useMutation({
    mutationFn: (data: CreateSlotFormData) => 
      slotsAPI.create({
        teacher_id: data.teacher_id,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        week_start_date: data.week_start_date,
      }),
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to create slot')
    },
  })

  const onSubmit = (data: CreateSlotFormData) => {
    setError(null)
    createSlotMutation.mutate(data)
  }

  const selectedTeacher = watch('teacher_id')
  const selectedTeacherData = teachers.find(t => t.id === selectedTeacher)

  const days = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' },
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Create New Slot</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 mb-1">
              Teacher *
            </label>
            <select
              {...register('teacher_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user?.full_name} - {teacher.subject}
                  {teacher.branch && ` (${teacher.branch})`}
                </option>
              ))}
            </select>
            {errors.teacher_id && (
              <p className="mt-1 text-sm text-red-600">{errors.teacher_id.message}</p>
            )}
          </div>

          {selectedTeacherData && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="text-sm">
                <span className="font-medium">Selected Teacher:</span> {selectedTeacherData.user?.full_name}
              </div>
              <div className="text-sm text-gray-600">
                Subject: {selectedTeacherData.subject}
                {selectedTeacherData.branch && ` - ${selectedTeacherData.branch}`}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week *
              </label>
              <select
                {...register('day_of_week', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {days.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
              {errors.day_of_week && (
                <p className="mt-1 text-sm text-red-600">{errors.day_of_week.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="week_start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Week Start Date *
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSlotMutation.isPending}
            >
              {createSlotMutation.isPending ? 'Creating...' : 'Create Slot'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Helper function to get next Monday's date
function getNextMonday(): string {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek // 0 is Sunday
  const nextMonday = new Date(today)
  nextMonday.setDate(today.getDate() + daysUntilMonday)
  return nextMonday.toISOString().split('T')[0]
}
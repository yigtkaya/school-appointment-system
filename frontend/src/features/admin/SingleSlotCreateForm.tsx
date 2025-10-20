import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'
import { useTeachers, useCreateSlot } from '@/hooks'

const singleSlotSchema = z.object({
  teacher_id: z.string().min(1, 'Please select a teacher'),
  day_of_week: z.number().min(0).max(6, 'Please select a valid day'),
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

type SingleSlotFormData = z.infer<typeof singleSlotSchema>

interface SingleSlotCreateFormProps {
  onClose: () => void
  onSuccess: () => void
}

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Get the next Monday from today
const getNextMonday = (): string => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  const nextMonday = new Date(today)
  nextMonday.setDate(today.getDate() + daysUntilMonday)
  return nextMonday.toISOString().split('T')[0]
}

export function SingleSlotCreateForm({ onClose }: SingleSlotCreateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SingleSlotFormData>({
    resolver: zodResolver(singleSlotSchema),
    defaultValues: {
      day_of_week: 0,
      week_start_date: getNextMonday(),
    },
  })

  const { data: teachers } = useTeachers()

  const createMutation = useCreateSlot()

  const onSubmit = (data: SingleSlotFormData) => {
    createMutation.mutate(data)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-blue-500" />
            <CardTitle>Create Single Slot</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Create a single time slot for a teacher
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {/* Day Selection */}
          <div>
            <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-1">
              Day of Week *
            </label>
            <select
              {...register('day_of_week', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {dayNames.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
            {errors.day_of_week && (
              <p className="mt-1 text-sm text-red-600">{errors.day_of_week.message}</p>
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

          <div className="flex items-center space-x-3 pt-2">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? 'Creating Slot...' : 'Create Slot'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { useTeachers, useCreateSlot, useTeacherByUserId } from '@/hooks'
import { useAuthStore, useIsTeacher } from '@/stores/auth'

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

  const { user } = useAuthStore()
  const isTeacher = useIsTeacher()
  const { data: teachers } = useTeachers()
  const { data: currentTeacherData } = useTeacherByUserId(user?.id || '')

  const createMutation = useCreateSlot()

  const onSubmit = (data: SingleSlotFormData) => {
    createMutation.mutate(data)
  }

  // If user is a teacher, they can only create slots for themselves
  const isTeacherUser = isTeacher && currentTeacherData?.id

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        {/* Day and Time Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-2">
              Day
            </label>
            <select
              {...register('day_of_week', { valueAsNumber: true })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            >
              {dayNames.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
            {errors.day_of_week && (
              <p className="mt-1 text-sm text-red-500">{errors.day_of_week.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <div className="flex gap-2">
              <input
                {...register('start_time')}
                type="time"
                placeholder="Start"
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              />
              <input
                {...register('end_time')}
                type="time"
                placeholder="End"
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              />
            </div>
            {errors.start_time && (
              <p className="mt-1 text-sm text-red-500">{errors.start_time.message}</p>
            )}
            {errors.end_time && (
              <p className="mt-1 text-sm text-red-500">{errors.end_time.message}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Slot'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

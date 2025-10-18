import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { slotsAPI } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Teacher } from '@/types/api'

const timeSlotSchema = z.object({
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
}).refine(
  (data) => data.start_time < data.end_time,
  {
    message: "End time must be after start time",
    path: ["end_time"],
  }
)

const bulkCreateSchema = z.object({
  teacher_id: z.string().min(1, 'Teacher is required'),
  week_start_date: z.string().min(1, 'Week start date is required'),
  time_slots: z.array(timeSlotSchema).min(1, 'At least one time slot is required'),
})

type BulkCreateFormData = z.infer<typeof bulkCreateSchema>
type TimeSlotData = z.infer<typeof timeSlotSchema>

interface BulkSlotCreateFormProps {
  teachers: Teacher[]
  onClose: () => void
  onSuccess: () => void
}

export function BulkSlotCreateForm({ teachers, onClose, onSuccess }: BulkSlotCreateFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlotData[]>([
    { day_of_week: 0, start_time: '09:00', end_time: '10:00' }
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BulkCreateFormData>({
    resolver: zodResolver(bulkCreateSchema),
    defaultValues: {
      week_start_date: getNextMonday(),
      time_slots: timeSlots,
    },
  })

  const createBulkSlotsMutation = useMutation({
    mutationFn: (data: BulkCreateFormData) => 
      slotsAPI.createBulk({
        teacher_id: data.teacher_id,
        week_start_date: data.week_start_date,
        time_slots: data.time_slots,
      }),
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to create slots')
    },
  })

  const selectedTeacher = watch('teacher_id')
  const selectedTeacherData = teachers.find(t => t.id === selectedTeacher)

  const addTimeSlot = () => {
    const newSlots = [...timeSlots, { day_of_week: 0, start_time: '09:00', end_time: '10:00' }]
    setTimeSlots(newSlots)
    setValue('time_slots', newSlots)
  }

  const removeTimeSlot = (index: number) => {
    const newSlots = timeSlots.filter((_, i) => i !== index)
    setTimeSlots(newSlots)
    setValue('time_slots', newSlots)
  }

  const updateTimeSlot = (index: number, field: keyof TimeSlotData, value: string | number) => {
    const newSlots = [...timeSlots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setTimeSlots(newSlots)
    setValue('time_slots', newSlots)
  }

  const onSubmit = (data: BulkCreateFormData) => {
    setError(null)
    createBulkSlotsMutation.mutate(data)
  }

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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Bulk Create Slots</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          Create multiple time slots for a teacher in one week
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Time Slots</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTimeSlot}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Slot
              </Button>
            </div>

            <div className="space-y-4">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day
                    </label>
                    <select
                      value={slot.day_of_week}
                      onChange={(e) => updateTimeSlot(index, 'day_of_week', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {days.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) => updateTimeSlot(index, 'start_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => updateTimeSlot(index, 'end_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTimeSlot(index)}
                      disabled={timeSlots.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {errors.time_slots && (
              <p className="mt-1 text-sm text-red-600">{errors.time_slots.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBulkSlotsMutation.isPending}
            >
              {createBulkSlotsMutation.isPending ? 'Creating...' : `Create ${timeSlots.length} Slots`}
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
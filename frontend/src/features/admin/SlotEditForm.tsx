import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { slotsAPI } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { AvailableSlot, Teacher } from '@/types/api'

const editSlotSchema = z.object({
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

type EditSlotFormData = z.infer<typeof editSlotSchema>

interface SlotEditFormProps {
  slot: AvailableSlot
  teachers: Teacher[]
  onClose: () => void
  onSuccess: () => void
}

export function SlotEditForm({ slot, onClose, onSuccess }: SlotEditFormProps) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditSlotFormData>({
    resolver: zodResolver(editSlotSchema),
    defaultValues: {
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      week_start_date: slot.week_start_date,
    },
  })

  const updateSlotMutation = useMutation({
    mutationFn: (data: EditSlotFormData) => 
      slotsAPI.update(slot.id, {
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        week_start_date: data.week_start_date,
      }),
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to update slot')
    },
  })

  const onSubmit = (data: EditSlotFormData) => {
    setError(null)
    updateSlotMutation.mutate(data)
  }

  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('slot.editSlot')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          {t('slot.management')}: {slot.teacher?.user?.full_name} ({slot.teacher?.subject})
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="text-sm">
              <span className="font-medium">{t('appointments.teacher')}:</span> {slot.teacher?.user?.full_name}
            </div>
            <div className="text-sm text-gray-600">
              {t('teachers.subject')}: {slot.teacher?.subject}
              {slot.teacher?.branch && ` - ${slot.teacher.branch}`}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-1">
                {t('appointments.date')} *
              </label>
              <select
                {...register('day_of_week', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {dayKeys.map((dayKey, index) => (
                  <option key={index} value={index}>
                    {t(`days.${dayKey}`)}
                  </option>
                ))}
              </select>
              {errors.day_of_week && (
                <p className="mt-1 text-sm text-red-600">{errors.day_of_week.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="week_start_date" className="block text-sm font-medium text-gray-700 mb-1">
                {t('slot.form.startDate')} *
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
                {t('slot.form.startTime')} *
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
                {t('slot.form.endTime')} *
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
              {t('buttons.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={updateSlotMutation.isPending}
            >
              {updateSlotMutation.isPending ? t('common.loading') : t('slot.editSlot')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
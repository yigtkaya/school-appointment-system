import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, User, Edit2, X, Check } from 'lucide-react'
import { useSlotById, useUpdateSlot } from '@/hooks'
import { useTeacherTodaysAppointments } from '@/hooks/appointments'
import { useAuthStore } from '@/stores/auth'
import { formatTime, formatDate } from '@/lib/day-time-utils'

interface SlotDetailsModalProps {
  slotId: string
  open: boolean
  onClose: () => void
}

const updateSlotSchema = z.object({
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
})

type UpdateSlotFormData = z.infer<typeof updateSlotSchema>

const getDayName = (dayNumber: number) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return days[dayNumber] || 'Unknown'
}

export function SlotDetailsModal({ slotId, open, onClose }: SlotDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { user } = useAuthStore()
  const { data: slot, isLoading } = useSlotById(slotId)
  const updateMutation = useUpdateSlot()
  
  // Fetch appointments for this teacher to find the appointment for this slot
  const { data: appointmentsData } = useTeacherTodaysAppointments(slot?.teacher_id || '')
  
  // Find the appointment that matches this slot
  const slotAppointment = appointmentsData?.appointments?.find(
    appointment => appointment.slot_id === slotId
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateSlotFormData>({
    resolver: zodResolver(updateSlotSchema),
    defaultValues: {
      start_time: slot?.start_time || '',
      end_time: slot?.end_time || '',
    },
  })

  // Update form when slot data loads - use useEffect to avoid infinite renders
  useEffect(() => {
    if (slot && !isEditing) {
      reset({ start_time: slot.start_time, end_time: slot.end_time })
    }
  }, [slot, isEditing, reset])

  const canEdit = user?.role === 'teacher' || user?.role === 'admin'

  const handleUpdateSlot = (data: UpdateSlotFormData) => {
    updateMutation.mutate(
      {
        slotId,
        data: {
          start_time: data.start_time,
          end_time: data.end_time,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false)
        },
      }
    )
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading slot details...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!slot) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Slot not found</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Slot Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Slot Status */}
          <div className="flex items-center gap-3">
            <Badge className={slot.is_booked ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}>
              {slot.is_booked ? 'BOOKED' : 'AVAILABLE'}
            </Badge>
          </div>

          {/* Appointment Information (if booked) - Show first */}
          {slot.is_booked && slotAppointment && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700 mb-3 font-semibold">Student Information</div>
                  
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-500 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-500">Student Name</div>
                      <div className="text-lg font-semibold">{slotAppointment.child_name || 'No name provided'}</div>
                      <div className="text-sm text-gray-600">
                        {slotAppointment.child_year && slotAppointment.child_class ? 
                          `Year ${slotAppointment.child_year} - Class ${slotAppointment.child_class}` : 
                          'Year and class not provided'
                        }
                      </div>
                    </div>
                  </div>

                  {slotAppointment.parent_contact && (
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-gray-500 mt-1" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-500">Parent Contact</div>
                        <div className="text-lg font-semibold">{slotAppointment.parent_contact}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Badge className="mt-1" variant={slotAppointment.status === 'confirmed' ? 'default' : 'secondary'}>
                      {slotAppointment.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schedule Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500">Date</div>
                    <div className="text-sm">{formatDate(slot.week_start_date)}</div>
                    <div className="text-sm text-gray-600">{getDayName(slot.day_of_week)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Time</div>
                      {canEdit && !isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleSubmit(handleUpdateSlot)} className="space-y-3 mt-2">
                        <div className="space-y-2">
                          <label className="text-sm text-gray-600">Start Time</label>
                          <input
                            {...register('start_time')}
                            type="time"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          {errors.start_time && (
                            <p className="text-sm text-red-600">{errors.start_time.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-gray-600">End Time</label>
                          <input
                            {...register('end_time')}
                            type="time"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          {errors.end_time && (
                            <p className="text-sm text-red-600">{errors.end_time.message}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={updateMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditing(false)
                              reset({ start_time: slot.start_time, end_time: slot.end_time })
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-sm">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Information - Show at bottom */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500">Your Slot (Teacher)</div>
                  <div className="text-lg font-semibold">{slot.teacher?.user?.full_name || 'N/A'}</div>
                  <div className="text-sm text-gray-600">{slot.teacher?.subject || 'N/A'}</div>
                  {slot.teacher?.branch && (
                    <div className="text-sm text-gray-500">Branch: {slot.teacher.branch}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Created: {new Date(slot.created_at).toLocaleString()}</div>
            {slot.updated_at && (
              <div>Last updated: {new Date(slot.updated_at).toLocaleString()}</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

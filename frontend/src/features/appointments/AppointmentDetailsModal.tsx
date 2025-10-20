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
import { Calendar, Clock, User, Phone, FileText, Edit2, X, Check } from 'lucide-react'
import { useAppointmentById, useUpdateAppointment } from '@/hooks'
import { useAuthStore } from '@/stores/auth'
import { formatTime, formatDate } from '@/lib/day-time-utils'

interface AppointmentDetailsModalProps {
  appointmentId: string
  open: boolean
  onClose: () => void
}

const updateNotesSchema = z.object({
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
})

type UpdateNotesFormData = z.infer<typeof updateNotesSchema>

export function AppointmentDetailsModal({ appointmentId, open, onClose }: AppointmentDetailsModalProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const { user } = useAuthStore()
  const { data: appointment, isLoading } = useAppointmentById(appointmentId)
  const updateMutation = useUpdateAppointment()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateNotesFormData>({
    resolver: zodResolver(updateNotesSchema),
    defaultValues: {
      notes: appointment?.notes || '',
    },
  })

  // Update form when appointment data loads
  useEffect(() => {
    if (appointment && !isEditingNotes) {
      reset({ notes: appointment.notes || '' })
    }
  }, [appointment, isEditingNotes, reset])

  const canEditNotes = user?.role === 'admin' || user?.role === 'teacher'

  const handleUpdateNotes = (data: UpdateNotesFormData) => {
    updateMutation.mutate(
      {
        appointmentId,
        data: { notes: data.notes },
      },
      {
        onSuccess: () => {
          setIsEditingNotes(false)
        },
      }
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMeetingModeColor = (mode: string) => {
    return mode === 'online'
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-teal-100 text-teal-800 border-teal-200'
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading appointment details...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!appointment) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Appointment not found</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status and Meeting Mode */}
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status.toUpperCase()}
            </Badge>
            <Badge className={getMeetingModeColor(appointment.meeting_mode)}>
              {appointment.meeting_mode === 'online' ? 'Online Meeting' : 'Face-to-Face'}
            </Badge>
          </div>

          {/* Child Information - Show First */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 mb-3 font-semibold">Student Information</div>
                
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500">Student Name</div>
                    <div className="text-lg font-semibold">{appointment.child_name}</div>
                    <div className="text-sm text-gray-600">
                      Year {appointment.child_year} - Class {appointment.child_class}
                    </div>
                  </div>
                </div>
                {appointment.parent_contact && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-500 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-500">Parent Contact</div>
                      <div className="text-lg font-semibold">{appointment.parent_contact}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Teacher Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500">Teacher</div>
                  <div className="text-lg font-semibold">{appointment.teacher?.user?.full_name || 'N/A'}</div>
                  <div className="text-sm text-gray-600">{appointment.teacher?.subject || 'N/A'}</div>
                  {appointment.teacher?.branch && (
                    <div className="text-sm text-gray-500">Branch: {appointment.teacher.branch}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500">Date</div>
                    <div className="text-sm">{formatDate(appointment.slot?.week_start_date)}</div>
                    <div className="text-sm text-gray-600">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][
                        appointment.slot?.day_of_week || 0
                      ]}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500">Time</div>
                    <div className="text-sm">
                      {formatTime(appointment.slot?.start_time)} - {formatTime(appointment.slot?.end_time)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-500">Notes</div>
                    {canEditNotes && !isEditingNotes && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingNotes(true)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>

                  {isEditingNotes ? (
                    <form onSubmit={handleSubmit(handleUpdateNotes)} className="space-y-3">
                      <textarea
                        {...register('notes')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add notes about this appointment..."
                      />
                      {errors.notes && (
                        <p className="text-sm text-red-600">{errors.notes.message}</p>
                      )}
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
                            setIsEditingNotes(false)
                            reset({ notes: appointment.notes || '' })
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {appointment.notes || 'No notes available'}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Created: {new Date(appointment.created_at).toLocaleString()}</div>
            {appointment.updated_at && (
              <div>Last updated: {new Date(appointment.updated_at).toLocaleString()}</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

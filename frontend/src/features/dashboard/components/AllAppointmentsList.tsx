import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/day-time-utils'
import { getStatusBadgeColor } from '../utils/appointmentUtils'
import { AppointmentDetailsModal } from '@/features/appointments'
import type { Appointment } from '@/types/api'

interface AllAppointmentsListProps {
  appointments: Appointment[] | undefined
  onConfirm: (appointmentId: string) => void
  onReject: (appointmentId: string, reason: string) => void
}

export function AllAppointmentsList({
  appointments,
  onConfirm,
  onReject,
}: AllAppointmentsListProps) {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('appointments.title')}</CardTitle>
        <p className="text-sm text-gray-600">{t('dashboard.allAppointments')}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments?.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{appointment.parent?.student_name}</span>
                  <Badge variant="outline">{appointment.parent?.student_class}</Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Parent: {appointment.parent?.user?.full_name}</div>
                  <div>
                    {formatDate(appointment.slot?.week_start_date)} at {formatTime(appointment.slot?.start_time)} -{' '}
                    {appointment.meeting_mode}
                  </div>
                  {appointment.notes && (
                    <div className="bg-gray-100 p-2 rounded text-xs">
                      <strong>{t('appointments.notes')}:</strong> {appointment.notes}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusBadgeColor(appointment.status)}>
                  {t(`appointments.status.${appointment.status}`)}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAppointmentId(appointment.id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {t('buttons.view')}
                </Button>
                {appointment.status === 'pending' && (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => onConfirm(appointment.id)}>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt(t('appointments.confirmation.importantInformation'))
                        if (reason) onReject(appointment.id, reason)
                      }}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Appointment Details Modal */}
      {selectedAppointmentId && (
        <AppointmentDetailsModal
          appointmentId={selectedAppointmentId}
          open={!!selectedAppointmentId}
          onClose={() => setSelectedAppointmentId(null)}
        />
      )}
    </Card>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, User, Calendar, CheckCircle, XCircle, Eye } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/day-time-utils'
import { AppointmentDetailsModal } from '@/features/appointments'
import type { Appointment } from '@/types/api'

interface PendingAppointmentsProps {
  appointments: Appointment[] | undefined
  onConfirm: (appointmentId: string) => void
  onReject: (appointmentId: string, reason: string) => void
  isConfirming?: boolean
  isRejecting?: boolean
}

export function PendingAppointments({
  appointments,
  onConfirm,
  onReject,
  isConfirming = false,
  isRejecting = false,
}: PendingAppointmentsProps) {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const { t } = useTranslation()

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          {t('dashboard.pendingAppointments')}
          {appointments && appointments.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {appointments.length}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">{t('appointments.confirmation.confirmAppointmentDesc')}</p>
      </CardHeader>
      <CardContent>
        {appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold">{appointment.parent?.student_name}</span>
                      <Badge variant="outline">{appointment.parent?.student_class}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(appointment.slot?.week_start_date)} at {formatTime(appointment.slot?.start_time)}
                        </span>
                      </div>
                      <div>Parent: {appointment.parent?.user?.full_name}</div>
                      <div>Mode: {appointment.meeting_mode}</div>
                      {appointment.notes && (
                        <div className="bg-white p-2 rounded border">
                          <strong>{t('appointments.notes')}:</strong> {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedAppointmentId(appointment.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {t('buttons.view')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onConfirm(appointment.id)}
                      disabled={isConfirming}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t('appointments.confirm')}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt(t('appointments.modal.edit'))
                        if (reason) {
                          onReject(appointment.id, reason)
                        }
                      }}
                      disabled={isRejecting}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      {t('appointments.cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>{t('dashboard.noAppointments')}</p>
            <p className="text-sm">{t('common.today')}</p>
          </div>
        )}
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

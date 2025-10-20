import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, User, Eye } from 'lucide-react'
import { formatTime } from '@/lib/day-time-utils'
import { getStatusBadgeColor } from '../utils/appointmentUtils'
import { AppointmentDetailsModal } from '@/features/appointments'
import type { Appointment } from '@/types/api'

interface TodaysScheduleProps {
  appointments: Appointment[] | undefined
}

export function TodaysSchedule({ appointments }: TodaysScheduleProps) {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Today's Schedule
        </CardTitle>
        <p className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </CardHeader>
      <CardContent>
        {appointments && appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{appointment.parent?.student_name}</div>
                    <div className="text-sm text-gray-600">
                      {formatTime(appointment.slot?.start_time)} - {appointment.meeting_mode}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusBadgeColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAppointmentId(appointment.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No appointments today</p>
            <p className="text-sm">Enjoy your free day!</p>
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

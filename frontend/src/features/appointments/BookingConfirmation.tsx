import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Video, 
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import type { AvailableSlot, MeetingMode, Teacher } from '@/types/api'

interface ChildInfo {
  child_name: string
  child_year: string
  child_class: string
  parent_contact?: string
}

interface BookingConfirmationProps {
  teacher: Teacher
  slot: AvailableSlot
  meetingMode: MeetingMode
  notes?: string
  childInfo?: ChildInfo
  onConfirm: () => void
  onEdit: () => void
  isLoading?: boolean
  error?: string | null
}


export function BookingConfirmation({
  teacher,
  slot,
  meetingMode,
  notes,
  childInfo,
  onConfirm,
  onEdit,
  isLoading = false,
  error = null
}: BookingConfirmationProps) {
  const { t } = useTranslation()
  const DAYS_OF_WEEK = [
    t('common.days.monday'), t('common.days.tuesday'), t('common.days.wednesday'), 
    t('common.days.thursday'), t('common.days.friday'), t('common.days.saturday'), t('common.days.sunday')
  ]
  
  const dayName = DAYS_OF_WEEK[slot.day_of_week]
  const formattedDate = formatDate(slot.week_start_date, slot.day_of_week)
  const timeRange = formatTimeRange(slot.start_time, slot.end_time)
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t('appointments.confirmation.confirmAppointment')}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {t('appointments.confirmation.confirmAppointmentDesc')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Teacher Information */}
          <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{teacher.user.full_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{teacher.subject}</Badge>
                {teacher.branch && (
                  <Badge variant="outline">{teacher.branch}</Badge>
                )}
              </div>
              {teacher.bio && (
                <p className="text-sm text-gray-600 mt-2">{teacher.bio}</p>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date & Time */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">{t('appointments.confirmation.dateTime')}</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-800">{dayName}</p>
                <p className="text-sm text-gray-800">{formattedDate}</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span className="text-sm text-gray-600">{timeRange}</span>
                </div>
              </div>
            </div>

            {/* Meeting Format */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {meetingMode === 'online' ? (
                  <Video className="h-4 w-4 text-gray-600" />
                ) : (
                  <MapPin className="h-4 w-4 text-gray-600" />
                )}
                <span className="font-medium text-gray-900">{t('appointments.confirmation.meetingFormat')}</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-800">
                  {meetingMode === 'online' ? t('appointments.confirmation.onlineMeeting') : t('appointments.confirmation.faceToFace')}
                </p>
                <p className="text-xs text-gray-600">
                  {meetingMode === 'online' 
                    ? t('appointments.confirmation.onlineMeetingLink')
                    : t('appointments.confirmation.faceToFaceLocation')
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Student Information */}
          {childInfo && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">{t('appointments.confirmation.studentInformation')}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t('appointments.confirmation.studentName')}</span>
                  <p className="font-medium text-gray-900">{childInfo.child_name}</p>
                </div>
                <div>
                  <span className="text-gray-600">{t('appointments.confirmation.yearClass')}</span>
                  <p className="font-medium text-gray-900">{t('appointments.modal.yearClass', { year: childInfo.child_year, class: childInfo.child_class })}</p>
                </div>
                {childInfo.parent_contact && (
                  <div className="col-span-2">
                    <span className="text-gray-600">{t('appointments.confirmation.contact')}</span>
                    <p className="font-medium text-gray-900">{childInfo.parent_contact}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">{t('appointments.confirmation.additionalNotes')}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-900">{t('appointments.confirmation.bookingError')}</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Important Information */}
          <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
            <h4 className="font-medium text-amber-900 mb-2">{t('appointments.confirmation.importantInformation')}</h4>
            <ul className="space-y-1 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-amber-600 rounded-full mt-2" />
                <span>
                  {t('appointments.confirmation.confirmationEmail')}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-amber-600 rounded-full mt-2" />
                <span>
                  {t('appointments.confirmation.arriveEarly')}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-amber-600 rounded-full mt-2" />
                <span>
                  {t('appointments.confirmation.cancelReschedule')}
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? t('appointments.confirmation.booking') : t('appointments.confirmation.confirmAppointmentBtn')}
            </Button>
            <Button
              variant="outline"
              onClick={onEdit}
              disabled={isLoading}
              className="flex-1"
            >
              {t('appointments.confirmation.editDetails')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatDate(weekStartDate: string, dayOfWeek: number): string {
  const date = new Date(weekStartDate)
  date.setDate(date.getDate() + dayOfWeek)
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} - ${formatTime(end)}`
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}
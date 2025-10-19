import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { formatTime } from '@/lib/day-time-utils'
import { getStatusBadgeColor, groupAppointmentsByDay } from '../utils/appointmentUtils'
import { addDays, formatWeekRange, isCurrentWeek, isToday, navigateWeek } from '../utils/calendarUtils'
import type { Appointment } from '@/types/api'

interface CalendarViewProps {
    appointments: Appointment[] | undefined
    currentWeek: Date
    onWeekChange: (newWeek: Date) => void
    onConfirm: (appointmentId: string) => void
    onReject: (appointmentId: string, reason: string) => void
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function CalendarView({
    appointments,
    currentWeek,
    onWeekChange,
    onConfirm,
    onReject,
}: CalendarViewProps) {
    const weekEnd = addDays(currentWeek, 6)
    const isCurrentWeekView = isCurrentWeek(currentWeek)
    const appointmentsByDay = groupAppointmentsByDay(appointments, currentWeek, addDays)

    const handleNavigate = (direction: 'prev' | 'next') => {
        onWeekChange(navigateWeek(currentWeek, direction))
    }

    const handleGoToToday = () => {
        const today = new Date()
        const weekStart = new Date(today)
        const day = weekStart.getDay()
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
        weekStart.setDate(diff)
        onWeekChange(weekStart)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <h2 className="text-xl font-semibold text-gray-900">Weekly Appointments</h2>
                        </div>

                        {/* Week Navigation */}
                        <div className="flex items-center space-x-4">
                            <div className="text-lg font-medium">{formatWeekRange(currentWeek, weekEnd)}</div>

                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleNavigate('prev')}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                <Button
                                    variant={isCurrentWeekView ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={handleGoToToday}
                                >
                                    This Week
                                </Button>

                                <Button variant="outline" size="sm" onClick={() => handleNavigate('next')}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Schedule Grid */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            {/* Header Row */}
                            <thead>
                                <tr>
                                    <th className="w-20 p-3 text-left border-b border-gray-200 bg-gray-50">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                    </th>
                                    {DAY_NAMES.map((dayName, index) => {
                                        const dayDate = addDays(currentWeek, index)
                                        const isTodayDate = isToday(dayDate)

                                        return (
                                            <th
                                                key={dayName}
                                                className={`p-3 text-center border-b border-gray-200 bg-gray-50 ${isTodayDate ? 'bg-blue-50' : ''
                                                    }`}
                                            >
                                                <div className="text-sm font-medium">{dayName}</div>
                                                <div className={`text-xs ${isTodayDate ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                                                    {dayDate.getDate()}/{dayDate.getMonth() + 1}
                                                </div>
                                            </th>
                                        )
                                    })}
                                </tr>
                            </thead>

                            {/* Appointments */}
                            <tbody>
                                <tr>
                                    <td className="p-3 text-sm text-gray-600 border-r border-gray-200 bg-gray-50">
                                        Appointments
                                    </td>
                                    {DAY_NAMES.map((_, dayIndex) => {
                                        const dayAppointments = appointmentsByDay[dayIndex] || []
                                        const dayDate = addDays(currentWeek, dayIndex)
                                        const isTodayDate = isToday(dayDate)

                                        return (
                                            <td
                                                key={dayIndex}
                                                className={`p-2 border-r border-gray-200 align-top ${isTodayDate ? 'bg-blue-50/30' : ''
                                                    }`}
                                            >
                                                <div className="space-y-2 min-h-[300px]">
                                                    {dayAppointments.map((appointment) => (
                                                        <div
                                                            key={appointment.id}
                                                            className={`
                                p-3 rounded-lg text-sm border transition-all hover:shadow-md
                                ${getStatusBadgeColor(appointment.status)}
                              `}
                                                            title={`${appointment.parent?.student_name} - ${appointment.parent?.user?.full_name}`}
                                                        >
                                                            <div className="font-medium text-sm mb-1">
                                                                {formatTime(appointment.slot?.start_time || '')} -{' '}
                                                                {formatTime(appointment.slot?.end_time || '')}
                                                            </div>
                                                            <div className="text-xs mb-2">{appointment.parent?.student_name}</div>
                                                            <div className="text-xs text-gray-600 mb-2">
                                                                Parent: {appointment.parent?.user?.full_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mb-2">
                                                                {appointment.parent?.student_class} • {appointment.meeting_mode}
                                                            </div>
                                                            {appointment.notes && (
                                                                <div className="text-xs text-gray-600 mb-2 italic">
                                                                    "{appointment.notes}"
                                                                </div>
                                                            )}
                                                            <div className="flex items-center justify-between">
                                                                <Badge
                                                                    variant={
                                                                        appointment.status === 'confirmed'
                                                                            ? 'default'
                                                                            : appointment.status === 'pending'
                                                                                ? 'secondary'
                                                                                : 'destructive'
                                                                    }
                                                                    className="text-xs"
                                                                >
                                                                    {appointment.status}
                                                                </Badge>
                                                                {appointment.status === 'pending' && (
                                                                    <div className="flex gap-1">
                                                                        <Button
                                                                            size="sm"
                                                                            className="h-6 px-2 text-xs"
                                                                            onClick={() => onConfirm(appointment.id)}
                                                                        >
                                                                            ✓
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            className="h-6 px-2 text-xs"
                                                                            onClick={() => {
                                                                                const reason = prompt('Reason for rejection:')
                                                                                if (reason) onReject(appointment.id, reason)
                                                                            }}
                                                                        >
                                                                            ✕
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {dayAppointments.length === 0 && (
                                                        <div className="text-center text-gray-400 text-sm py-8">
                                                            No appointments
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                        )
                    })}
                </tr>
            </tbody>
        </table>
    </div>
            </div>            
            {/* Summary */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                        <span className="text-sm text-gray-600">Confirmed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                        <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                        <span className="text-sm text-gray-600">Today</span>
                    </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>
                            {Object.values(appointmentsByDay).reduce((total, dayApts) => total + dayApts.length, 0)}{' '}
                            appointments this week
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

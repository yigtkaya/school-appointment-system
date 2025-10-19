import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { slotsAPI } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User } from 'lucide-react'
import type { AvailableSlot } from '@/types/api'

interface SlotSelectorProps {
  teacherId: string
  selectedSlot: AvailableSlot | null
  onSlotSelect: (slot: AvailableSlot) => void
  weekStartDate?: string
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

export function SlotSelector({ 
  teacherId, 
  selectedSlot, 
  onSlotSelect, 
  weekStartDate 
}: SlotSelectorProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    weekStartDate || getCurrentWeekStart()
  )

  const { data: scheduleData, isLoading, error } = useQuery({
    queryKey: ['teacher-schedule', teacherId, currentWeekStart],
    queryFn: () => slotsAPI.getTeacherSchedule(teacherId, { 
      week_start: currentWeekStart 
    }),
    enabled: !!teacherId
  })

  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart)
    prevWeek.setDate(prevWeek.getDate() - 7)
    setCurrentWeekStart(prevWeek.toISOString().split('T')[0])
  }

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart)
    nextWeek.setDate(nextWeek.getDate() + 7)
    setCurrentWeekStart(nextWeek.toISOString().split('T')[0])
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Time Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Clock className="h-5 w-5" />
            Error Loading Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Failed to load available time slots. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  const { teacher, schedule, week_start, week_end } = scheduleData || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Available Time Slots
        </CardTitle>
        {teacher && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{teacher.user.full_name}</span>
            <Badge variant="secondary">{teacher.subject}</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            ← Previous Week
          </Button>
          <div className="text-sm font-medium">
            {formatWeekRange(week_start, week_end)}
          </div>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            Next Week →
          </Button>
        </div>

        {/* Slots Grid */}
        <div className="space-y-3">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            const dayKey = getDayKey(currentWeekStart, dayIndex)
            const daySlots = schedule?.[dayKey] || []
            const availableSlots = daySlots.filter(slot => !slot.is_booked)

            if (availableSlots.length === 0) {
              return (
                <div key={dayName} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{dayName}</h4>
                    <span className="text-sm text-gray-500">No available slots</span>
                  </div>
                </div>
              )
            }

            return (
              <div key={dayName} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{dayName}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSlotSelect(slot)}
                      className="text-xs"
                    >
                      {formatTimeRange(slot.start_time, slot.end_time)}
                    </Button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {selectedSlot && (
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Selected Slot</h4>
            <div className="text-sm text-blue-800">
              <p>{DAYS_OF_WEEK[selectedSlot.day_of_week]}</p>
              <p>{formatTimeRange(selectedSlot.start_time, selectedSlot.end_time)}</p>
              <p className="text-xs text-blue-600 mt-1">
                Week of {formatDate(selectedSlot.week_start_date)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getCurrentWeekStart(): string {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)
  return monday.toISOString().split('T')[0]
}

function getDayKey(weekStart: string, dayIndex: number): string {
  const date = new Date(weekStart)
  date.setDate(date.getDate() + dayIndex)
  return date.toISOString().split('T')[0]
}

function formatWeekRange(start?: string, end?: string): string {
  if (!start || !end) return ''
  
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  return `${startDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })} - ${endDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })}`
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
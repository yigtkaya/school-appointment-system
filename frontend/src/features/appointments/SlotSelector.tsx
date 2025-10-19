import { useState } from 'react'
import { Clock } from 'lucide-react'
import type { AvailableSlot } from '@/types/api'
import { useTeacherSchedule } from '@/hooks/slots'

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
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const { data: scheduleData, isLoading, error } = useTeacherSchedule(teacherId, currentWeekStart)

  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart)
    prevWeek.setDate(prevWeek.getDate() - 7)
    setCurrentWeekStart(prevWeek.toISOString().split('T')[0])
    setSelectedDay(null) // Clear selection when changing weeks
  }

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart)
    nextWeek.setDate(nextWeek.getDate() + 7)
    setCurrentWeekStart(nextWeek.toISOString().split('T')[0])
    setSelectedDay(null) // Clear selection when changing weeks
  }

  const handleDaySelect = (dayIndex: number) => {
    setSelectedDay(dayIndex)
  }

  const handleBackToWeekView = () => {
    setSelectedDay(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 mx-auto mb-4 text-red-300" />
        <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Schedule</h3>
        <p className="text-gray-600">
          Failed to load available time slots. Please try again.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  if (!scheduleData) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No Schedule Available</h3>
        <p className="text-gray-600">
          No schedule data found for this teacher this week.
        </p>
      </div>
    )
  }

  const { week_start_date, slots_by_day } = scheduleData || {}

  // If a day is selected, show only that day's slots
  if (selectedDay !== null) {
    const daySlots = slots_by_day?.[selectedDay] || []
    const availableSlots = daySlots.filter((slot: AvailableSlot) => !slot.is_booked)
    const selectedDayName = DAYS_OF_WEEK[selectedDay]
    const selectedDate = new Date(week_start_date || '')
    selectedDate.setDate(selectedDate.getDate() + selectedDay)

    return (
      <div className="space-y-6">
        {/* Simple Back Navigation */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBackToWeekView}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="font-semibold text-lg text-gray-900">{selectedDayName}</div>
            <div className="text-sm text-gray-500">
              {selectedDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Time slots for selected day */}
        {availableSlots.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableSlots.map((slot: AvailableSlot) => (
              <button
                key={slot.id}
                onClick={() => onSlotSelect(slot)}
                className={`
                  p-3 rounded-lg border text-center transition-all
                  ${selectedSlot?.id === slot.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }
                `}
              >
                <div className="font-medium text-sm">
                  {formatTimeRange(slot.start_time, slot.end_time)}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No available slots for {selectedDayName}</p>
          </div>
        )}

        {selectedSlot && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="font-medium text-blue-900 mb-1">Selected Time</div>
            <div className="text-blue-800">
              <span className="font-medium">{selectedDayName}</span> at <span className="font-mono">{formatTimeRange(selectedSlot.start_time, selectedSlot.end_time)}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default view: show week overview with days to select
  return (
    <div className="space-y-6">
      {/* Simple Week Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={goToPreviousWeek}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {formatWeekRange(scheduleData?.week_start_date, getWeekEndDate(scheduleData?.week_start_date))}
          </div>
          <div className="text-sm text-gray-500">
            {scheduleData?.available_slots || 0} available slots
          </div>
        </div>
        
        <button 
          onClick={goToNextWeek}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Clean Days Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS_OF_WEEK.map((dayName, dayIndex) => {
          const daySlots = scheduleData?.slots_by_day?.[dayIndex] || []
          const availableSlots = daySlots.filter((slot: AvailableSlot) => !slot.is_booked)
          const dayDate = new Date(scheduleData?.week_start_date || '')
          dayDate.setDate(dayDate.getDate() + dayIndex)

          return (
            <button
              key={dayName}
              onClick={() => availableSlots.length > 0 && handleDaySelect(dayIndex)}
              disabled={availableSlots.length === 0}
              className={`
                p-6 rounded-lg border text-center transition-all
                ${availableSlots.length > 0 
                  ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer' 
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                }
              `}
            >
              <div className="font-semibold text-lg text-gray-900">{dayName}</div>
              <div className="text-gray-600 mt-1">
                {dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className={`text-sm mt-2 font-medium ${availableSlots.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                {availableSlots.length > 0 
                  ? `${availableSlots.length} slots`
                  : 'No slots'
                }
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function getCurrentWeekStart(): string {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)
  return monday.toISOString().split('T')[0]
}


function getWeekEndDate(weekStart?: string): string {
  if (!weekStart) return ''
  const startDate = new Date(weekStart)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  return endDate.toISOString().split('T')[0]
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


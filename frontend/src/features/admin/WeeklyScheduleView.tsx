import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Plus, Sparkles } from 'lucide-react'
import { formatTime } from '@/lib/day-time-utils'
import { SmartSlotCreateForm } from './SmartSlotCreateForm'
import { SingleSlotCreateForm } from './SingleSlotCreateForm'
import type { AvailableSlot } from '@/types/api'
import { useTeachers, useSlots, useTeacherByUserId } from '@/hooks'
import { useScheduleFilterStore } from '@/stores/admin'
import { useAuthStore, useIsTeacher } from '@/stores/auth'

enum WeekDay {
  MONDAY = 0,
  TUESDAY = 1,
  WEDNESDAY = 2,
  THURSDAY = 3,
  FRIDAY = 4,
  SATURDAY = 5,
  SUNDAY = 6,
}

const getDayName = (dayNumber: number) => {
  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]
  return days[dayNumber] || 'Unknown'
}

// Get the start of the current week (Monday)
const getWeekStart = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

// Format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// Add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Add weeks to a date

interface WeeklyScheduleViewProps {
  selectedTeacher?: string
  onTeacherChange?: (teacherId: string) => void
}

export function WeeklyScheduleView({ selectedTeacher, onTeacherChange }: WeeklyScheduleViewProps) {
  const [showSmartSlotDialog, setShowSmartSlotDialog] = useState(false)
  const [showSingleSlotDialog, setShowSingleSlotDialog] = useState(false)

  const { currentWeek, navigateWeek, goToToday } = useScheduleFilterStore()
  const { user } = useAuthStore()
  const isTeacher = useIsTeacher()

  const { data: teachers } = useTeachers()
  const { data: currentTeacherData } = useTeacherByUserId(user?.id || '')

  // Auto-select current teacher if they are a teacher
  const effectiveTeacherId = isTeacher && currentTeacherData?.id ? currentTeacherData.id : (selectedTeacher || '')

  const { data: slotsResponse, isLoading } = useSlots({
    teacher_id: effectiveTeacherId || undefined,
    limit: 200
    // Remove week_start filter to show all slots, we'll filter client-side
  })

  const allSlots = slotsResponse?.slots || []

  // Filter slots to show only those that belong to the current week being viewed
  const slots = allSlots.filter((slot: AvailableSlot) => {
    // Parse the slot's week_start_date
    const slotWeekStart = new Date(slot.week_start_date)
    
    // Calculate the Monday-based week start for the current week
    const currentWeekStart = getWeekStart(currentWeek)
    
    // Check if the slot's week overlaps with the current week
    // A slot belongs to the current week if its week_start is within 6 days of our Monday
    const daysDiff = Math.abs((slotWeekStart.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysDiff <= 6
  })

  // Group slots by day and time range for better visualization
  const slotsByDay: Record<number, AvailableSlot[]> = {}
  
  slots.forEach((slot: AvailableSlot) => {
    const day = slot.day_of_week
    if (!slotsByDay[day]) {
      slotsByDay[day] = []
    }
    slotsByDay[day].push(slot)
  })

  // Sort slots within each day by start time
  Object.keys(slotsByDay).forEach(day => {
    slotsByDay[parseInt(day)].sort((a, b) => a.start_time.localeCompare(b.start_time))
  })

  const weekEnd = addDays(currentWeek, 6)
  const isCurrentWeek = formatDate(getWeekStart(new Date())) === formatDate(currentWeek)
  const canChangeTeacher = !isTeacher

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Weekly Schedule</h2>
          </div>
          
          {/* Teacher Filter - Only show if user is not a teacher */}
          {canChangeTeacher && onTeacherChange && (
            <select
              value={effectiveTeacherId}
              onChange={(e) => onTeacherChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {teachers?.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user?.full_name} - {teacher.subject}
                </option>
              ))}
            </select>
          )}
          
          {/* Show current teacher name if user is a teacher */}
          {isTeacher && currentTeacherData && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-md border border-blue-200">
              {currentTeacherData.user?.full_name} - {currentTeacherData.subject}
            </div>
          )}

          <Button onClick={() => setShowSingleSlotDialog(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Single Slot
          </Button>

          <Button onClick={() => setShowSmartSlotDialog(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Smart Slots
          </Button>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center space-x-4">
          <div className="text-lg font-medium text-gray-900">
            {currentWeek.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })} - {weekEnd.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant={isCurrentWeek ? "default" : "outline"}
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading schedule...
            </div>
          ) : slots.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="mb-2">No slots found for this week</div>
              <div className="text-sm text-gray-400">
                Week: {formatDate(currentWeek)}
                {effectiveTeacherId && ` | Teacher: ${teachers?.find(t => t.id === effectiveTeacherId)?.user?.full_name}`}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Header Row */}
                <thead>
                  <tr>
                    <th className="w-20 p-3 text-left border-b border-gray-200 bg-gray-50">
                      <Clock className="w-4 h-4 text-gray-500" />
                    </th>
                    {Object.keys(WeekDay).filter(key => !isNaN(Number(key))).map((dayNum) => {
                      const dayIndex = parseInt(dayNum)
                      const dayName = getDayName(dayIndex)
                      const dayDate = addDays(currentWeek, dayIndex)
                      const isToday = dayDate.toDateString() === new Date().toDateString()
                      
                      return (
                        <th key={dayNum} className={`p-3 text-center border-b border-gray-200 bg-gray-50 ${isToday ? 'bg-blue-50' : ''}`}>
                          <div className="text-sm font-medium">{dayName}</div>
                          <div className={`text-xs ${isToday ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                            {dayDate.getDate()}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>

                {/* Day Columns - Show all slots for each day */}
                <tbody>
                  <tr>
                    <td className="p-3 text-sm text-gray-600 border-r border-gray-200 bg-gray-50">
                      All Times
                    </td>
                    {Object.keys(WeekDay).filter(key => !isNaN(Number(key))).map((dayNum) => {
                      const dayIndex = parseInt(dayNum)
                      const daySlots = slotsByDay[dayIndex] || []
                      const isToday = addDays(currentWeek, dayIndex).toDateString() === new Date().toDateString()
                      
                      return (
                        <td key={dayNum} className={`p-2 border-r border-gray-200 align-top ${isToday ? 'bg-blue-50/30' : ''}`}>
                          <div className="space-y-2 min-h-[400px]">
                            {daySlots.map(slot => (
                              <div
                                key={slot.id}
                                className={`
                                  p-3 rounded-lg text-sm cursor-pointer transition-all hover:shadow-md border
                                  ${slot.is_booked 
                                    ? 'bg-red-100 border-red-200 text-red-700 hover:bg-red-200' 
                                    : 'bg-green-100 border-green-200 text-green-700 hover:bg-green-200'
                                  }
                                `}
                                title={`${slot.teacher?.user?.full_name} - ${slot.teacher?.subject}\n${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}\n${slot.is_booked ? 'Booked' : 'Available'}`}
                              >
                                <div className="font-medium text-sm mb-1">
                                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                </div>
                                <div className="text-xs text-gray-600 mb-2">
                                  {slot.teacher?.user?.full_name || 'Unknown Teacher'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {slot.teacher?.subject}
                                </div>
                                <div className="mt-2">
                                  <Badge 
                                    variant={slot.is_booked ? "destructive" : "default"}
                                    className="text-xs"
                                  >
                                    {slot.is_booked ? 'Booked' : 'Available'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {daySlots.length === 0 && (
                              <div className="text-center text-gray-400 text-sm py-8">
                                No slots scheduled
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
          )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-sm text-gray-600">Available Slot</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-sm text-gray-600">Booked Slot</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
            <span className="text-sm text-gray-600">Today</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>{slots.length} total slots</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>{slots.filter(s => !s.is_booked).length} available</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>{slots.filter(s => s.is_booked).length} booked</span>
          </div>
        </div>
      </div>

      {/* Single Slot Create Dialog */}
      <Dialog open={showSingleSlotDialog} onOpenChange={setShowSingleSlotDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Single Slot</DialogTitle>
          </DialogHeader>
          <SingleSlotCreateForm
            onClose={() => setShowSingleSlotDialog(false)}
            onSuccess={() => {
              setShowSingleSlotDialog(false)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Smart Create Slots Dialog */}
      <Dialog open={showSmartSlotDialog} onOpenChange={setShowSmartSlotDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Smart Slot Creator</DialogTitle>
          </DialogHeader>
          <SmartSlotCreateForm
            onClose={() => setShowSmartSlotDialog(false)}
            onSuccess={() => {
              setShowSmartSlotDialog(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
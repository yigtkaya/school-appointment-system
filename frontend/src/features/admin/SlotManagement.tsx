import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { slotsAPI, teachersAPI } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Sparkles, List, Calendar } from 'lucide-react'
import { SlotEditForm } from './SlotEditForm'
import { SmartSlotCreateForm } from './SmartSlotCreateForm'
import { WeeklyScheduleView } from './WeeklyScheduleView'
import { formatDate, formatTime } from '@/lib/utils'
import type { AvailableSlot } from '@/types/api'

export function SlotManagement() {
  const [showSmartCreateForm, setShowSmartCreateForm] = useState(false)
  const [editingSlot, setEditingSlot] = useState<AvailableSlot | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar')
  const queryClient = useQueryClient()

  const { data: slotsResponse, isLoading: slotsLoading, error: slotsError } = useQuery({
    queryKey: ['slots', selectedTeacher],
    queryFn: () => slotsAPI.getAll({ 
      teacher_id: selectedTeacher || undefined,
      limit: 100 
    }),
  })

  const slots = slotsResponse?.slots || []

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersAPI.getAll(),
  })

  const deleteSlotMutation = useMutation({
    mutationFn: (slotId: string) => slotsAPI.delete(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })

  const handleDeleteSlot = async (slot: AvailableSlot) => {
    if (slot.is_booked) {
      alert('Cannot delete a booked slot')
      return
    }

    if (window.confirm(`Are you sure you want to delete this slot? This action cannot be undone.`)) {
      try {
        await deleteSlotMutation.mutateAsync(slot.id)
      } catch (error) {
        console.error('Failed to delete slot:', error)
      }
    }
  }

  const getDayName = (dayNumber: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return days[dayNumber] || 'Unknown'
  }

  if (slotsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Loading slots...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (slotsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">
            Error loading slots: {slotsError instanceof Error ? slotsError.message : 'Unknown error'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Slot Management</CardTitle>
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex items-center border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="rounded-r-none"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Calendar
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-l"
                >
                  <List className="w-4 h-4 mr-1" />
                  List
                </Button>
              </div>
              
              <Button onClick={() => setShowSmartCreateForm(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Slots
              </Button>
            </div>
          </div>
        </CardHeader>
        {viewMode === 'list' && (
          <CardContent>
            {/* Teacher Filter */}
            <div className="mb-6">
              <label htmlFor="teacher-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Teacher
              </label>
              <select
                id="teacher-filter"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Teachers</option>
                {teachers?.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.user?.full_name} - {teacher.subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Slots List */}
            <div className="space-y-4">
              {slots?.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                    slot.is_booked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium text-lg">
                          {slot.teacher?.user?.full_name || 'No teacher'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Subject: {slot.teacher?.subject}
                          {slot.teacher?.branch && ` - ${slot.teacher.branch}`}
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="text-sm">
                            <span className="font-medium">Day:</span> {getDayName(slot.day_of_week)}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Time:</span> {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Week:</span> {formatDate(slot.week_start_date)}
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge 
                            variant={slot.is_booked ? "destructive" : "default"}
                          >
                            {slot.is_booked ? 'Booked' : 'Available'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!slot.is_booked && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSlot(slot)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    {!slot.is_booked && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSlot(slot)}
                        disabled={deleteSlotMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    )}
                    {slot.is_booked && (
                      <Button variant="outline" size="sm" disabled>
                        View Appointment
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {(!slots || slots.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No slots found. Add a slot to get started.
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <WeeklyScheduleView 
          selectedTeacher={selectedTeacher}
          onTeacherChange={setSelectedTeacher}
        />
      )}

      {/* Smart Create Slots Form */}
      {showSmartCreateForm && (
        <SmartSlotCreateForm
          onClose={() => setShowSmartCreateForm(false)}
          onSuccess={() => {
            setShowSmartCreateForm(false)
            queryClient.invalidateQueries({ queryKey: ['slots'] })
          }}
        />
      )}

      {/* Edit Slot Form */}
      {editingSlot && (
        <SlotEditForm
          slot={editingSlot}
          teachers={teachers || []}
          onClose={() => setEditingSlot(null)}
          onSuccess={() => {
            setEditingSlot(null)
            queryClient.invalidateQueries({ queryKey: ['slots'] })
          }}
        />
      )}
    </div>
  )
}
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { appointmentsAPI, slotsAPI, calendarAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime } from '@/lib/day-time-utils'
import type { AvailableSlot } from '@/types/api'

type TabOption = 'overview' | 'schedule' | 'appointments' | 'slots'

export function TeacherDashboard() {
  const { user } = useAuthStore()
  const [selectedTab, setSelectedTab] = useState<TabOption>('overview')
  
  const { data: teacherAppointments } = useQuery({
    queryKey: ['teacher-appointments', user?.id],
    queryFn: () => appointmentsAPI.getTeacherAppointments(user?.id || ''),
    enabled: !!user?.id,
  })

  const { data: teacherSlots } = useQuery({
    queryKey: ['teacher-slots', user?.id],
    queryFn: () => slotsAPI.getAll({ teacher_id: user?.id }),
    enabled: !!user?.id,
  })

  const { data: weeklySchedule } = useQuery({
    queryKey: ['weekly-schedule', user?.id],
    queryFn: () => calendarAPI.getEnhancedWeekly(user?.id || ''),
    enabled: !!user?.id,
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const todaysAppointments = teacherAppointments?.filter(apt => {
    const today = new Date().toISOString().split('T')[0]
    return apt.slot?.week_start_date === today
  }) || []

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teacherAppointments?.length || 0}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {teacherSlots?.slots?.filter((slot: AvailableSlot) => !slot.is_booked).length || 0}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todaysAppointments.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {weeklySchedule?.statistics?.utilization_rate ? 
              `${Math.round(weeklySchedule.statistics.utilization_rate * 100)}%` : '0%'}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teacherAppointments?.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{appointment.parent?.student_name}</div>
                  <div className="text-sm text-gray-600">
                    Class: {appointment.parent?.student_class}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(appointment.slot?.week_start_date)} at {formatTime(appointment.slot?.start_time)}
                  </div>
                  <div className="text-sm text-gray-500">Mode: {appointment.meeting_mode}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusBadgeColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSchedule = () => (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <div className="text-sm text-gray-600">
          Week: {weeklySchedule?.week_start} to {weeklySchedule?.week_end}
        </div>
      </CardHeader>
      <CardContent>
        {weeklySchedule?.schedule && (
          <div className="grid grid-cols-7 gap-4">
            {Object.entries(weeklySchedule.schedule).map(([day, slots]) => (
              <div key={day} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{day}</h3>
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <div 
                      key={slot.id} 
                      className={`p-2 rounded text-xs ${
                        slot.is_booked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      {slot.is_booked && <div className="mt-1">Booked</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderAppointments = () => (
    <Card>
      <CardHeader>
        <CardTitle>All Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teacherAppointments?.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{appointment.parent?.student_name}</div>
                <div className="text-sm text-gray-600">
                  Parent: {appointment.parent?.user?.full_name}
                </div>
                <div className="text-sm text-gray-600">
                  Class: {appointment.parent?.student_class}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(appointment.slot?.week_start_date)} at {formatTime(appointment.slot?.start_time)}
                </div>
                <div className="text-sm text-gray-500">Mode: {appointment.meeting_mode}</div>
                {appointment.notes && (
                  <div className="text-sm text-gray-500 mt-1">Notes: {appointment.notes}</div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusBadgeColor(appointment.status)}>
                  {appointment.status}
                </Badge>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderSlots = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Time Slots</CardTitle>
          <Button size="sm">Add Slot</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teacherSlots?.slots?.map((slot: AvailableSlot) => (
            <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">
                  Day {slot.day_of_week} - {formatTime(slot.start_time)} to {formatTime(slot.end_time)}
                </div>
                <div className="text-sm text-gray-600">
                  Week starting: {formatDate(slot.week_start_date)}
                </div>
                <div className="text-sm text-gray-500">
                  Status: {slot.is_booked ? 'Booked' : 'Available'}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={slot.is_booked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {slot.is_booked ? 'Booked' : 'Available'}
                </Badge>
                <Button variant="outline" size="sm">Edit</Button>
                {!slot.is_booked && (
                  <Button variant="destructive" size="sm">Delete</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">Manage your schedule and appointments</p>
        </div>

        <div className="flex space-x-4 border-b">
          {['overview', 'schedule', 'appointments', 'slots'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as TabOption)}
              className={`px-4 py-2 font-medium capitalize ${
                selectedTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div>
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'schedule' && renderSchedule()}
          {selectedTab === 'appointments' && renderAppointments()}
          {selectedTab === 'slots' && renderSlots()}
        </div>
      </div>
    </DashboardLayout>
  )
}
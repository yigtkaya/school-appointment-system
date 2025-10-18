import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { appointmentsAPI, teachersAPI, slotsAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime } from '@/lib/day-time-utils'

enum TabOption {
  OVERVIEW = 'overview',
  APPOINTMENTS = 'appointments',
  BOOK = 'book',
  TEACHERS = 'teachers',
}

export function ParentDashboard() {
  const { user } = useAuthStore()
  const [selectedTab, setSelectedTab] = useState<TabOption>(TabOption.OVERVIEW)

  const { data: parentAppointments } = useQuery({
    queryKey: ['parent-appointments', user?.id],
    queryFn: () => appointmentsAPI.getParentAppointments(user?.id || ''),
    enabled: !!user?.id,
  })

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersAPI.getAll(),
  })

  const { data: availableSlots } = useQuery({
    queryKey: ['available-slots'],
    queryFn: () => slotsAPI.getAll({ available: true }),
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

  const upcomingAppointments = parentAppointments?.filter(apt => {
    const appointmentDate = new Date(apt.slot?.week_start_date || '')
    return appointmentDate >= new Date() && apt.status !== 'cancelled'
  }) || []

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{parentAppointments?.length || 0}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teachers?.length || 0}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{availableSlots?.slots?.length || 0}</div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{appointment.teacher?.user?.full_name}</div>
                  <div className="text-sm text-gray-600">
                    Subject: {appointment.teacher?.subject}
                    {appointment.teacher?.branch && ` - ${appointment.teacher.branch}`}
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
            {upcomingAppointments.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No upcoming appointments. Book a new appointment to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAppointments = () => (
    <Card>
      <CardHeader>
        <CardTitle>All Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {parentAppointments?.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{appointment.teacher?.user?.full_name}</div>
                <div className="text-sm text-gray-600">
                  Subject: {appointment.teacher?.subject}
                  {appointment.teacher?.branch && ` - ${appointment.teacher.branch}`}
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
                <Button variant="outline" size="sm">View</Button>
                {appointment.status === 'pending' && (
                  <Button variant="destructive" size="sm">Cancel</Button>
                )}
              </div>
            </div>
          ))}
          {!parentAppointments?.length && (
            <div className="text-center text-gray-500 py-8">
              No appointments found. Book your first appointment!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderBooking = () => (
    <Card>
      <CardHeader>
        <CardTitle>Book New Appointment</CardTitle>
        <p className="text-sm text-gray-600">Select a teacher and available time slot</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-4">Available Teachers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers?.map((teacher) => (
                <div key={teacher.id} className="border rounded-lg p-4">
                  <div className="font-medium">{teacher.user?.full_name}</div>
                  <div className="text-sm text-gray-600">{teacher.subject}</div>
                  {teacher.branch && (
                    <div className="text-sm text-gray-500">Branch: {teacher.branch}</div>
                  )}
                  {teacher.bio && (
                    <div className="text-sm text-gray-500 mt-2">{teacher.bio}</div>
                  )}
                  <Button className="mt-3" size="sm">
                    View Slots
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Available Time Slots</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableSlots?.slots?.slice(0, 9).map((slot) => (
                <div key={slot.id} className="border rounded-lg p-4">
                  <div className="font-medium">{slot.teacher?.user?.full_name}</div>
                  <div className="text-sm text-gray-600">{slot.teacher?.subject}</div>
                  <div className="text-sm text-gray-500">
                    {formatDate(slot.week_start_date)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </div>
                  <Button className="mt-3 w-full" size="sm">
                    Book This Slot
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderTeachers = () => (
    <Card>
      <CardHeader>
        <CardTitle>All Teachers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers?.map((teacher) => (
            <div key={teacher.id} className="border rounded-lg p-6">
              <div className="font-medium text-lg">{teacher.user?.full_name}</div>
              <div className="text-gray-600 mt-1">{teacher.subject}</div>
              {teacher.branch && (
                <div className="text-sm text-gray-500">Branch: {teacher.branch}</div>
              )}
              {teacher.bio && (
                <div className="text-sm text-gray-600 mt-3">{teacher.bio}</div>
              )}
              <div className="mt-4 space-x-2">
                <Button size="sm">View Schedule</Button>
                <Button variant="outline" size="sm">Book Appointment</Button>
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
          <h1 className="text-3xl font-bold">Parent Dashboard</h1>
          <p className="text-gray-600">Manage your child's appointments and view teacher information</p>
        </div>

        <div className="flex space-x-4 border-b">
          {Object.values(TabOption).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as TabOption)}
              className={`px-4 py-2 font-medium capitalize ${
                selectedTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'book' ? 'Book Appointment' : tab}
            </button>
          ))}
        </div>

        <div>
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'appointments' && renderAppointments()}
          {selectedTab === 'book' && renderBooking()}
          {selectedTab === 'teachers' && renderTeachers()}
        </div>
      </div>
    </DashboardLayout>
  )
}
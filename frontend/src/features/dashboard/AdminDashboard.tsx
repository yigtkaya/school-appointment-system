import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { teachersAPI, parentsAPI, appointmentsAPI, notificationsAPI } from '@/api'
import { type Appointment, type Teacher, type Parent, type Notification } from '@/types/api'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime } from '@/lib/utils'

enum TabOption {
  OVERVIEW = 'overview',
  TEACHERS = 'teachers',
  PARENTS = 'parents',
  APPOINTMENTS = 'appointments',
  NOTIFICATIONS = 'notifications',
}

export function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState<TabOption>(TabOption.OVERVIEW)

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersAPI.getAll(),
  })

  const { data: parents } = useQuery({
    queryKey: ['parents'],
    queryFn: () => parentsAPI.getAll(),
  })

  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentsAPI.getAll(),
  })

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getAll(),
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

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teachers?.length || 0}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{parents?.length || 0}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{appointments?.length || 0}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{notifications?.length || 0}</div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments?.slice(0, 5).map((appointment: Appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{appointment.parent?.student_name}</div>
                  <div className="text-sm text-gray-600">
                    {appointment.teacher?.user?.full_name} - {appointment.teacher?.subject}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(appointment.slot?.week_start_date)} at {formatTime(appointment.slot?.start_time)}
                  </div>
                </div>
                <Badge className={getStatusBadgeColor(appointment.status)}>
                  {appointment.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTeachers = () => (
    <Card>
      <CardHeader>
        <CardTitle>Teachers Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teachers?.map((teacher: Teacher) => (
            <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{teacher.user?.full_name}</div>
                <div className="text-sm text-gray-600">{teacher.user?.email}</div>
                <div className="text-sm text-gray-500">{teacher.subject} - {teacher.branch}</div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderParents = () => (
    <Card>
      <CardHeader>
        <CardTitle>Parents Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {parents?.map((parent: Parent) => (
            <div key={parent.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{parent.user?.full_name}</div>
                <div className="text-sm text-gray-600">{parent.user?.email}</div>
                <div className="text-sm text-gray-500">
                  Student: {parent.student_name} - Class: {parent.student_class}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            </div>
          ))}
        </div>
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
          {appointments?.map((appointment: Appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{appointment.parent?.student_name}</div>
                <div className="text-sm text-gray-600">
                  Teacher: {appointment.teacher?.user?.full_name} ({appointment.teacher?.subject})
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
  )

  const renderNotifications = () => (
    <Card>
      <CardHeader>
        <CardTitle>Notification Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications?.map((notification: Notification) => (
            <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{notification.subject}</div>
                <div className="text-sm text-gray-600">To: {notification.recipient_email}</div>
                <div className="text-sm text-gray-500">Type: {notification.type}</div>
                <div className="text-sm text-gray-500">{formatDate(notification.created_at)}</div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusBadgeColor(notification.status)}>
                  {notification.status}
                </Badge>
                {notification.status === 'failed' && (
                  <Button variant="outline" size="sm">Retry</Button>
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage the school appointment system</p>
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
              {tab}
            </button>
          ))}
        </div>

        <div>
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'teachers' && renderTeachers()}
          {selectedTab === 'parents' && renderParents()}
          {selectedTab === 'appointments' && renderAppointments()}
          {selectedTab === 'notifications' && renderNotifications()}
        </div>
      </div>
    </DashboardLayout>
  )
}
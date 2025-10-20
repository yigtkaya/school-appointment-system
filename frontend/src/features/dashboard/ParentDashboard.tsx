import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { appointmentsAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Clock, User, ArrowLeft, ChevronRight } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/day-time-utils'
import { AppointmentBookingModal } from '@/features/appointments'

type ViewMode = 'home' | 'appointments' | 'booking'

interface ParentDashboardProps {
  parentId?: string
  isPublic?: boolean
}

export function ParentDashboard({ parentId, isPublic = false }: ParentDashboardProps = {}) {
  const { user } = useAuthStore()
  const [currentView, setCurrentView] = useState<ViewMode>('home')
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  // Use provided parentId, authenticated user's id, or none if public and no auth
  const effectiveParentId = parentId || user?.id
  const shouldFetchAppointments = !isPublic || !!effectiveParentId

  const { data: parentAppointments } = useQuery({
    queryKey: ['parent-appointments', effectiveParentId],
    queryFn: () => appointmentsAPI.getParentAppointments(effectiveParentId || ''),
    enabled: shouldFetchAppointments && !!effectiveParentId,
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

  const renderHomeView = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="w-full max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 gap-8">
          {/* Book New Appointment Card */}
          <Card 
            className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-dashed border-blue-200 hover:border-blue-400 hover:scale-105 animate-in fade-in slide-in-from-left-8 duration-700"
            onClick={() => {
              setCurrentView('booking')
              setIsBookingModalOpen(true)
            }}
          >
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <Plus className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Book New Appointment</h2>
              <p className="text-gray-600 mb-6">Schedule a meeting with a teacher for your child</p>
              <div className="flex items-center justify-center text-blue-600 font-medium">
                Get Started
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>

          {/* View Appointments Card */}
          {/* <Card 
            className="group hover:shadow-2xl transition-all duration-500 cursor-pointer hover:scale-105 animate-in fade-in slide-in-from-right-8 duration-700"
            onClick={() => setCurrentView('appointments')}
          >
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors duration-300">
                <Calendar className="w-10 h-10 text-green-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">My Appointments</h2>
              <p className="text-gray-600 mb-6">View and manage your scheduled appointments</p>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-gray-900">
                  {parentAppointments?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Total appointments</div>
                <div className="text-lg font-medium text-green-600">
                  {upcomingAppointments.length} upcoming
                </div>
              </div>
              <div className="flex items-center justify-center text-green-600 font-medium mt-4">
                View Details
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  )

  const renderAppointmentsView = () => (
    <div className="min-h-screen bg-gray-50 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage your scheduled meetings with teachers</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              All Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parentAppointments?.map((appointment, index) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">{appointment.teacher?.user?.full_name}</div>
                      <div className="text-gray-600">
                        {appointment.teacher?.subject}
                        {appointment.teacher?.branch && ` - ${appointment.teacher.branch}`}
                      </div>
                      <div className="text-gray-500 flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(appointment.slot?.week_start_date)} at {formatTime(appointment.slot?.start_time)}
                        </span>
                        <span>•</span>
                        <span>{appointment.meeting_mode}</span>
                      </div>
                      {appointment.notes && (
                        <div className="text-gray-500 mt-2 text-sm">
                          <strong>Notes:</strong> {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusBadgeColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    {appointment.status === 'pending' && (
                      <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        Awaiting teacher confirmation
                      </div>
                    )}
                    {appointment.status === 'pending' && (
                      <Button variant="destructive" size="sm">
                        Cancel
                      </Button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!parentAppointments?.length && (
                <div className="text-center py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-gray-500 mb-2">No appointments yet</h3>
                  <p className="text-gray-400 mb-6">Get started by booking your first appointment</p>
                  <Button 
                    onClick={() => {
                      setCurrentView('booking')
                      setIsBookingModalOpen(true)
                    }}
                    className="px-8"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )


  return (
    <DashboardLayout>
      {currentView === 'home' && renderHomeView()}
      {currentView === 'appointments' && renderAppointmentsView()}
      
      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false)
          if (currentView === 'booking') {
            setCurrentView('home')
          }
        }}
      />
    </DashboardLayout>
  )
}
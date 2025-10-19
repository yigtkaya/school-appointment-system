import type { Appointment } from '@/types/api'

export const getStatusBadgeColor = (status: string) => {
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

export const groupAppointmentsByDay = (
  appointments: Appointment[] | undefined,
  currentWeek: Date,
  addDays: (date: Date, days: number) => Date
): Record<number, Appointment[]> => {
  const appointmentsByDay: Record<number, Appointment[]> = {}

  appointments?.forEach((apt) => {
    if (!apt.slot?.week_start_date || apt.status === 'cancelled') return

    const slotWeekStart = new Date(apt.slot.week_start_date)
    const appointmentDate = new Date(slotWeekStart)
    appointmentDate.setDate(slotWeekStart.getDate() + (apt.slot.day_of_week || 0))

    const currentWeekStart = currentWeek.toISOString().split('T')[0]
    const currentWeekEndDate = addDays(currentWeek, 6).toISOString().split('T')[0]
    const aptDateStr = appointmentDate.toISOString().split('T')[0]

    if (aptDateStr >= currentWeekStart && aptDateStr <= currentWeekEndDate) {
      const dayOfWeek = apt.slot.day_of_week || 0
      if (!appointmentsByDay[dayOfWeek]) {
        appointmentsByDay[dayOfWeek] = []
      }
      appointmentsByDay[dayOfWeek].push(apt)
    }
  })

  // Sort appointments within each day by start time
  Object.keys(appointmentsByDay).forEach((day) => {
    appointmentsByDay[parseInt(day)].sort((a, b) =>
      (a.slot?.start_time || '').localeCompare(b.slot?.start_time || '')
    )
  })

  return appointmentsByDay
}

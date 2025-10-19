/**
 * Calendar utilities for week navigation and date calculations
 */

export const getWeekStart = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const navigateWeek = (currentWeek: Date, direction: 'prev' | 'next'): Date => {
  const newWeek = new Date(currentWeek)
  newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7))
  return newWeek
}

export const isCurrentWeek = (weekStart: Date): boolean => {
  return weekStart.toDateString() === getWeekStart(new Date()).toDateString()
}

export const isToday = (date: Date): boolean => {
  return date.toDateString() === new Date().toDateString()
}

export const formatWeekRange = (startDate: Date, endDate: Date): string => {
  return `${startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} - ${endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`
}

import { createFileRoute } from '@tanstack/react-router'
import BookingPage from '@/pages/Booking'

export const Route = createFileRoute('/booking')({
  component: BookingPage,
})

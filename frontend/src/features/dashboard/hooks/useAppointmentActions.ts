import { useConfirmAppointment, useRejectAppointment } from '@/hooks/appointments'

/**
 * Convenience hook that combines confirm and reject mutations for the dashboard
 * This is a local hook that composes global hooks for easier component usage
 */
export const useAppointmentActions = () => {
  const confirmMutation = useConfirmAppointment()
  const rejectMutation = useRejectAppointment()

  const handleConfirm = (appointmentId: string) => {
    confirmMutation.mutate(appointmentId)
  }

  const handleReject = (appointmentId: string, reason: string) => {
    rejectMutation.mutate({ appointmentId, reason })
  }

  return {
    confirmMutation,
    rejectMutation,
    handleConfirm,
    handleReject,
  }
}

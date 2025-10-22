import { useState } from 'react';
import { CheckCircle, XCircle, Trash2, AlertCircle } from 'lucide-react';
import type { Appointment } from '../../api/types';
import { useUpdateAppointmentMutation } from '@/hooks/useAppointments';


interface AppointmentsListProps {
  appointments: Appointment[];
  isLoading: boolean;
  onAppointmentUpdate: () => void;
}

interface FilterType {
  pending: boolean;
  confirmed: boolean;
  rejected: boolean;
  cancelled: boolean;
}

/**
 * List of appointments with approval/rejection actions
 */
export function AppointmentsList({
  appointments,
  isLoading,
  onAppointmentUpdate,
}: AppointmentsListProps) {
  const [filter, setFilter] = useState<FilterType>({
    pending: true,
    confirmed: true,
    rejected: false,
    cancelled: false,
  });

    const updateMutation = useUpdateAppointmentMutation();

  // Filter appointments based on selected statuses
  const filteredAppointments = appointments.filter(
    (apt) => filter[apt.status as keyof FilterType]
  );

  // Sort by date (upcoming first)
  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => new Date(a.appointment_start).getTime() - new Date(b.appointment_start).getTime()
  );

  const handleApprove = async (appointmentId: number) => {
    try {
      await updateMutation.mutateAsync({
        id: appointmentId,
        data: {
          status: 'confirmed',
        },
      });
      onAppointmentUpdate();
    } catch (error) {
      console.error('Failed to approve appointment:', error);
    }
  };

  const handleReject = async (appointmentId: number) => {
    try {
      await updateMutation.mutateAsync({
        id: appointmentId,
        data: {
          status: 'rejected',
        },
      });
      onAppointmentUpdate();
    } catch (error) {
      console.error('Failed to reject appointment:', error);
    }
  };

  const handleCancel = async (appointmentId: number) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await updateMutation.mutateAsync({
          id: appointmentId,
          data: {
            status: 'cancelled',
          },
        });
        onAppointmentUpdate();
      } catch (error) {
        console.error('Failed to cancel appointment:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent mb-4"></div>
        <p className="text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(filter).map(([status, isActive]) => (
            <button
              key={status}
              onClick={() =>
                setFilter((prev) => ({
                  ...prev,
                  [status]: !prev[status as keyof FilterType],
                }))
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments list */}
      {sortedAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No appointments found</p>
          <p className="text-gray-500 text-sm">Try adjusting your filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAppointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.appointment_start);
            const endTime = new Date(appointment.appointment_end).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left: Date, time, parent info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      {getStatusBadge(appointment.status)}
                    </div>

                    <p className="font-semibold text-gray-900 truncate">
                      {appointment.parent_name}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{appointment.parent_email}</p>

                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-700">
                      <span className="font-medium">
                        {date} · {time} - {endTime}
                      </span>
                    </div>

                    {appointment.parent_phone && (
                      <p className="text-sm text-gray-600 mt-1">{appointment.parent_phone}</p>
                    )}

                    {appointment.note && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 text-sm text-gray-700">
                        <p className="font-medium text-blue-900 mb-1">Note:</p>
                        <p>{appointment.note}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Action buttons */}
                  <div className="flex flex-wrap gap-2 md:flex-col md:gap-2">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(appointment.id)}
                          disabled={updateMutation.isPending}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(appointment.id)}
                          disabled={updateMutation.isPending}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}

                    {(appointment.status === 'confirmed' ||
                      appointment.status === 'pending') && (
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        disabled={updateMutation.isPending}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Cancel
                      </button>
                    )}

                    {appointment.status !== 'pending' &&
                      appointment.status !== 'confirmed' && (
                        <div className="flex items-center justify-center px-4 py-2 text-gray-600 text-sm">
                          No actions available
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AppointmentsList;

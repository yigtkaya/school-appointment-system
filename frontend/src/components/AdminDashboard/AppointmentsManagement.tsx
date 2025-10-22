import { useState } from 'react';
import { useAdminAllAppointments, useTeachers, useAdminClasses } from '@/hooks';
import type { Appointment } from '@/api/types';
import { AlertCircle, Filter, Calendar, User, Mail } from 'lucide-react';

export function AppointmentsManagement() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [teacherFilter, setTeacherFilter] = useState<number | null>(null);
  const [classFilter, setClassFilter] = useState<number | null>(null);

  const { data: appointments, isLoading, isError } = useAdminAllAppointments({
    status: statusFilter || undefined,
    teacher_id: teacherFilter || undefined,
    class_id: classFilter || undefined,
  });

  const { data: teachers } = useTeachers();
  const { data: classes } = useAdminClasses();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
          </div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <p className="text-red-800">Failed to load appointments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Appointments Overview</h2>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{appointments?.length || 0}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teacher
            </label>
            <select
              value={teacherFilter || ''}
              onChange={(e) => setTeacherFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Teachers</option>
              {teachers?.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={classFilter || ''}
              onChange={(e) => setClassFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Classes</option>
              {classes?.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Grade {cls.grade} - Section {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('');
                setTeacherFilter(null);
                setClassFilter(null);
              }}
              className="w-full bg-gray-100 text-gray-900 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {appointments && appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Parent</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Teacher</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((appointment: Appointment) => {
                  // Find the teacher and class names
                  const teacher = teachers?.find((t) => t.id === appointment.teacher_id);
                  const classInfo = classes?.find((c) => c.id === appointment.class_id);

                  return (
                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDateTime(appointment.appointment_start)}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-gray-900 font-medium">{appointment.parent_name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <a
                                href={`mailto:${appointment.parent_email}`}
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                {appointment.parent_email}
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {teacher?.name || '—'}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {/* Student name would need to be fetched separately */}
                        Student #{appointment.student_id}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {classInfo ? `Grade ${classInfo.grade} - ${classInfo.section}` : '—'}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No appointments found matching the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useCreateAppointmentMutation } from '@/hooks/useAppointments';
import type { Class, Student, User, AvailableTime } from '@/api/types';

interface Step5Props {
  classData: Class;
  studentData: Student;
  teacherData: User;
  selectedDate: string;
  selectedTime: AvailableTime;
  onSuccess: (appointmentId: number) => void;
  onError: (error: string) => void;
}

export function Step5Confirmation({
  classData,
  studentData,
  teacherData,
  selectedDate,
  selectedTime,
  onSuccess,
  onError,
}: Step5Props) {
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAppointmentMutation = useCreateAppointmentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!parentName.trim()) {
      onError('Parent name is required');
      return;
    }
    if (!parentEmail.trim()) {
      onError('Parent email is required');
      return;
    }
    if (!parentEmail.includes('@')) {
      onError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time into ISO strings
      const [year, month, day] = selectedDate.split('-');
      const [startHour, startMin] = selectedTime.start_time.split(':');
      const [endHour, endMin] = selectedTime.end_time.split(':');

      const appointmentStart = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(startHour),
        parseInt(startMin)
      ).toISOString();

      const appointmentEnd = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(endHour),
        parseInt(endMin)
      ).toISOString();

      const response = await createAppointmentMutation.mutateAsync({
        teacher_id: teacherData.id,
        class_id: classData.id,
        student_id: studentData.id,
        appointment_start: appointmentStart,
        appointment_end: appointmentEnd,
        parent_name: parentName.trim(),
        parent_email: parentEmail.trim(),
        parent_phone: parentPhone.trim() || undefined,
        note: note.trim() || undefined,
      });

      onSuccess(response.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create appointment';
      onError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Appointment</h2>
        <p className="text-gray-600">Review your details and submit</p>
      </div>

      {/* Review Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Class</p>
            <p className="font-semibold text-gray-800">
              Grade {classData.grade}, Section {classData.section}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Student</p>
            <p className="font-semibold text-gray-800">{studentData.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Teacher</p>
            <p className="font-semibold text-gray-800">{teacherData.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Teacher Email</p>
            <p className="font-semibold text-gray-800">{teacherData.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-semibold text-gray-800">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Time</p>
            <p className="font-semibold text-gray-800">
              {selectedTime.start_time.substring(0, 5)} -{' '}
              {selectedTime.end_time.substring(0, 5)}
            </p>
          </div>
        </div>

        {teacherData.require_approval === 1 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              ⚠ This appointment is pending teacher approval
            </p>
          </div>
        )}
      </div>

      {/* Parent Information Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Parent Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parent Name *
          </label>
          <input
            type="text"
            required
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any relevant information about the meeting topic..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || createAppointmentMutation.isPending}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting || createAppointmentMutation.isPending
            ? 'Booking Appointment...'
            : 'Confirm Appointment'}
        </button>

        {createAppointmentMutation.isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              Error: {createAppointmentMutation.error?.message ||
                'Failed to create appointment'}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

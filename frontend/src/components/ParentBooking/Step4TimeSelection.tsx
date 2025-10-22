import { useState } from 'react';
import { useTeacherAvailableDates, useTeacherAvailableTimes } from '@/hooks/useSlots';
import type { AvailableTime } from '@/api/types';

interface Step4Props {
  teacherId: number | null;
  selectedDate: string | null;
  selectedTime: AvailableTime | null;
  onSelectDateTime: (date: string, time: AvailableTime) => void;
}

export function Step4TimeSelection({
  teacherId,
  selectedDate,
  selectedTime,
  onSelectDateTime,
}: Step4Props) {
  const { data: availableDates, isLoading: datesLoading, isError: datesError } =
    useTeacherAvailableDates(teacherId || 0);

  const { data: availableTimes, isLoading: timesLoading } = useTeacherAvailableTimes(
    teacherId || 0,
    selectedDate || ''
  );

  const [displayDate, setDisplayDate] = useState<string>(
    selectedDate || (availableDates && availableDates.length > 0 
      ? availableDates[0]
      : '')
  );

  if (!teacherId) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow border border-gray-200">
        <p className="text-gray-600">Please select a teacher first</p>
      </div>
    );
  }

  if (datesLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (datesError) {
    return (
      <div className="p-6 bg-white rounded-lg shadow border border-red-200">
        <p className="text-red-600">Error loading available dates</p>
      </div>
    );
  }

  if (!availableDates || availableDates.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow border border-yellow-200">
        <p className="text-yellow-700">Teacher has no available time slots</p>
      </div>
    );
  }

  const handleDateChange = (newDate: string) => {
    setDisplayDate(newDate);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Date & Time</h2>
        <p className="text-gray-600">Choose an available time slot</p>
      </div>

      {/* Date Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select a Date
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {availableDates.map((date) => {
            const dateObj = new Date(date);
            const isSelected = displayDate === date;

            return (
              <button
                key={date}
                onClick={() => handleDateChange(date)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold text-gray-800">
                  {dateObj.toLocaleDateString('en-US', {
                    weekday: 'short',
                  })}
                </div>
                <div className="text-sm text-gray-600">
                  {dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select a Time
        </label>

        {timesLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : !availableTimes || availableTimes.length === 0 ? (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
            No available times for the selected date
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {availableTimes.map((time) => (
              <button
                key={`${time.start_time}-${time.end_time}`}
                onClick={() => {
                  onSelectDateTime(displayDate, time);
                }}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  selectedTime?.start_time === time.start_time &&
                  selectedTime?.end_time === time.end_time &&
                  selectedDate === displayDate
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold text-gray-800 text-sm">
                  {time.start_time.substring(0, 5)}
                </div>
                <div className="text-xs text-gray-600">
                  {time.end_time.substring(0, 5)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedDate && selectedTime && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800">
            ✓ Selected: {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            at {selectedTime.start_time.substring(0, 5)}
          </p>
        </div>
      )}
    </div>
  );
}

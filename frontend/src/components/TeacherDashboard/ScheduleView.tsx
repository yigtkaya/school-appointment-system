import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import type { AvailableSlot, Appointment } from '../../api/types';
import { Button } from '@/components/ui/button';
import { ScheduleItemDetailModal } from './ScheduleItemDetailModal';
import type { ScheduleItemDetail } from './ScheduleItemDetailModal';
import CreateSlotModal from './CreateSlotModal';

interface ScheduleViewProps {
  appointments: Appointment[];
  slots: AvailableSlot[];
  isLoading: boolean;
  teacherId?: number;
  onSlotsUpdate?: () => void;
}

interface ScheduleItem {
  id: string;
  type: 'slot' | 'appointment';
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  status?: string;
  isActive?: boolean;
}

/**
 * Time Schedule View - Display open slots and booked appointments in a calendar/chart format
 * Shows a weekly or monthly overview with color-coded availability
 */
export function ScheduleView({
  appointments,
  slots,
  isLoading,
  teacherId = 0,
  onSlotsUpdate,
}: ScheduleViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState<ScheduleItemDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createSlotModalOpen, setCreateSlotModalOpen] = useState(false);

  // Parse time string to minutes since midnight
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Handle item click to show detail modal
  const handleItemClick = (item: ScheduleItem) => {
    const detailItem: ScheduleItemDetail = {
      id: item.id,
      type: item.type,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      title: item.title,
      description: item.description,
      status: item.status,
      isActive: item.isActive,
    };

    // Add appointment-specific details
    if (item.type === 'appointment') {
      const appointment = appointments.find((apt) => apt.id === parseInt(item.id.split('-')[1]));
      if (appointment) {
        detailItem.parentName = appointment.parent_name;
        detailItem.parentEmail = appointment.parent_email;
        detailItem.parentPhone = appointment.parent_phone || undefined;
        detailItem.studentId = appointment.student_id;
        detailItem.classId = appointment.class_id;
        detailItem.note = appointment.note || undefined;
      }
    }

    setSelectedItem(detailItem);
    setDetailModalOpen(true);
  };

  // Get time range for display (e.g., 8 AM to 6 PM)
  const BUSINESS_HOURS_START = 8; // 8 AM
  const BUSINESS_HOURS_END = 18; // 6 PM
  const HOUR_HEIGHT = 60; // pixels per hour

  // Combine slots and appointments into schedule items
  const scheduleItems = useMemo(() => {
    const items: ScheduleItem[] = [];

    // Add slots
    slots.forEach((slot) => {
      items.push({
        id: `slot-${slot.id}`,
        type: 'slot',
        date: slot.date,
        startTime: slot.start_time.substring(0, 5),
        endTime: slot.end_time.substring(0, 5),
        title: 'Available',
        isActive: slot.is_active,
      });
    });

    // Add appointments
    appointments.forEach((apt) => {
      const startDate = new Date(apt.appointment_start);
      const dateStr = startDate.toISOString().split('T')[0];
      const startTime = startDate.toTimeString().substring(0, 5);
      const endTime = new Date(apt.appointment_end).toTimeString().substring(0, 5);

      items.push({
        id: `apt-${apt.id}`,
        type: 'appointment',
        date: dateStr,
        startTime,
        endTime,
        title: apt.parent_name,
        description: `${apt.parent_email}`,
        status: apt.status,
      });
    });

    return items;
  }, [slots, appointments]);

  // Get days to display (week view only)
  const getDaysToDisplay = () => {
    const days = [];
    const start = new Date(currentDate);

    // Get Monday of current week
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    // Add 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const days = getDaysToDisplay();

  // Get items for a specific day
  const getItemsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduleItems
      .filter((item) => item.date === dateStr)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  };

  // Calculate position and height for schedule items
  const getItemStyle = (item: ScheduleItem) => {
    const startMinutes = timeToMinutes(item.startTime);
    const endMinutes = timeToMinutes(item.endTime);
    const top = (startMinutes - BUSINESS_HOURS_START * 60) / 60 * HOUR_HEIGHT;
    const height = (endMinutes - startMinutes) / 60 * HOUR_HEIGHT;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  // Get styling for items
  const getItemClasses = (item: ScheduleItem) => {
    if (item.type === 'slot') {
      return item.isActive
        ? 'bg-green-50 border-green-300 border-l-4'
        : 'bg-gray-50 border-gray-300 border-l-4 opacity-60';
    } else {
      const statusColors = {
        pending: 'bg-yellow-50 border-yellow-300 border-l-4',
        confirmed: 'bg-blue-50 border-blue-300 border-l-4',
        rejected: 'bg-red-50 border-red-300 border-l-4',
        cancelled: 'bg-gray-50 border-gray-300 border-l-4 opacity-60',
      };
      return statusColors[item.status as keyof typeof statusColors] || statusColors.pending;
    }
  };

  const getItemBadgeColor = (item: ScheduleItem) => {
    if (item.type === 'slot') {
      return item.isActive
        ? 'bg-green-100 text-green-700'
        : 'bg-gray-100 text-gray-700';
    } else {
      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        rejected: 'bg-red-100 text-red-700',
        cancelled: 'bg-gray-100 text-gray-700',
      };
      return statusColors[item.status as keyof typeof statusColors] || statusColors.pending;
    }
  };

  // Navigate to previous/next week
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent mb-4"></div>
        <p className="text-gray-600">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg min-w-fit">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {currentDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <Button
            onClick={handleNext}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {teacherId > 0 && (
          <Button
            onClick={() => setCreateSlotModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Create Slot
          </Button>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-l-4 border-green-300 bg-green-50"></div>
          <span className="text-sm text-gray-700">Available Slot</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-l-4 border-blue-300 bg-blue-50"></div>
          <span className="text-sm text-gray-700">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-l-4 border-yellow-300 bg-yellow-50"></div>
          <span className="text-sm text-gray-700">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-l-4 border-red-300 bg-red-50"></div>
          <span className="text-sm text-gray-700">Rejected</span>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header with day names */}
            <div className="flex border-b border-gray-200">
              <div className="w-16 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-2"></div>
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className="flex-1 min-w-[200px] bg-gray-50 border-r border-gray-200 p-4 text-center"
                >
                  <div className="text-sm font-semibold text-gray-900">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-xs text-gray-600">
                    {day.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div className="flex">
              {/* Time column */}
              <div className="w-16 flex-shrink-0 bg-gray-50 border-r border-gray-200">
                {Array.from({
                  length: BUSINESS_HOURS_END - BUSINESS_HOURS_START,
                }).map((_, i) => {
                  const hour = BUSINESS_HOURS_START + i;
                  return (
                    <div
                      key={hour}
                      className="h-[60px] border-b border-gray-200 flex items-center justify-center"
                    >
                      <span className="text-xs text-gray-600 font-medium">
                        {`${hour % 12 || 12}${hour >= 12 ? 'p' : 'a'}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Days grid */}
              <div className="flex flex-1">
                {days.map((day) => {
                  const dayItems = getItemsForDay(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className="flex-1 min-w-[200px] relative border-r border-gray-200"
                      style={{
                        height: `${(BUSINESS_HOURS_END - BUSINESS_HOURS_START) * HOUR_HEIGHT}px`,
                      }}
                    >
                      {/* Hour grid lines */}
                      {Array.from({
                        length: BUSINESS_HOURS_END - BUSINESS_HOURS_START,
                      }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-full border-b border-gray-100"
                          style={{
                            top: `${(i + 1) * HOUR_HEIGHT}px`,
                            height: '1px',
                          }}
                        ></div>
                      ))}

                      {/* Schedule items */}
                      {dayItems.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No events</span>
                        </div>
                      ) : (
                        dayItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`absolute left-0.5 right-0.5 rounded p-1 text-xs overflow-hidden cursor-pointer hover:shadow-md hover:z-10 transition-all ${getItemClasses(item)}`}
                            style={getItemStyle(item)}
                            title={`${item.title}: ${item.startTime} - ${item.endTime} (click for details)`}
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold truncate text-gray-900">
                                  {item.title}
                                </span>
                                <span
                                  className={`text-xs font-semibold px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${getItemBadgeColor(item)}`}
                                >
                                  {item.type === 'slot'
                                    ? 'Slot'
                                    : (item.status?.charAt(0).toUpperCase() ?? '') +
                                      (item.status?.slice(1) ?? '')}
                                </span>
                              </div>
                              <div className="text-gray-600 text-xs">
                                {item.startTime} - {item.endTime}
                              </div>
                              {item.description && (
                                <div className="text-gray-600 text-xs truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {scheduleItems.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">No schedule items</p>
          <p className="text-gray-500 text-sm">
            Create availability slots or appointments to see them here
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <ScheduleItemDetailModal
        item={selectedItem}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        teacherId={teacherId}
        onSlotUpdated={() => {
          onSlotsUpdate?.();
        }}
      />

      {/* Create Slot Modal */}
      <CreateSlotModal
        open={createSlotModalOpen}
        onOpenChange={setCreateSlotModalOpen}
        teacherId={teacherId}
        onSlotCreated={() => {
          onSlotsUpdate?.();
        }}
      />
    </div>
  );
}

export default ScheduleView;

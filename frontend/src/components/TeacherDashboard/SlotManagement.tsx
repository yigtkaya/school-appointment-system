import { useState } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, ChevronDown, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCreateSlotMutation, useUpdateSlotMutation, useDeleteSlotMutation } from '../../hooks';
import type { AvailableSlot } from '../../api/types';

interface SlotManagementProps {
  teacherId: number;
  slots: AvailableSlot[];
  isLoading: boolean;
  onSlotsUpdate: () => void;
}

interface SlotFormData {
  date: Date | null;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

/**
 * Manage teacher availability slots
 * Allows creating, editing, and deleting date-based time slots
 */
export function SlotManagement({
  teacherId,
  slots,
  isLoading,
  onSlotsUpdate,
}: SlotManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formData, setFormData] = useState<SlotFormData>({
    date: null,
    start_time: '09:00',
    end_time: '12:00',
    is_active: true,
  });

  const createMutation = useCreateSlotMutation(teacherId);
  const updateMutation = useUpdateSlotMutation(teacherId);
  const deleteMutation = useDeleteSlotMutation(teacherId);

  const handleCreateOrUpdate = async () => {
    if (!formData.date) {
      alert('Please select a date');
      return;
    }

    if (formData.start_time >= formData.end_time) {
      alert('End time must be after start time');
      return;
    }

    try {
      const dateStr = formData.date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD

      if (editingSlotId) {
        await updateMutation.mutateAsync({
          slotId: editingSlotId,
          data: {
            date: dateStr,
            start_time: `${formData.start_time}:00` as unknown as string,
            end_time: `${formData.end_time}:00` as unknown as string,
            is_active: formData.is_active,
          },
        } as never);
      } else {
        await createMutation.mutateAsync({
          teacher_id: teacherId,
          date: dateStr,
          start_time: `${formData.start_time}:00` as unknown as string,
          end_time: `${formData.end_time}:00` as unknown as string,
          timezone: 'UTC',
          is_active: formData.is_active,
        } as never);
      }
      setFormData({
        date: null,
        start_time: '09:00',
        end_time: '12:00',
        is_active: true,
      });
      setShowForm(false);
      setEditingSlotId(null);
      onSlotsUpdate();
    } catch (error) {
      console.error('Failed to save slot:', error);
      alert('Failed to save slot. Please try again.');
    }
  };

  const handleEdit = (slot: AvailableSlot) => {
    setEditingSlotId(slot.id);
    const slotDate = new Date(slot.date);
    setFormData({
      date: slotDate,
      start_time: slot.start_time.substring(0, 5),
      end_time: slot.end_time.substring(0, 5),
      is_active: slot.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (slotId: number) => {
    if (confirm('Are you sure you want to delete this time slot?')) {
      try {
        await deleteMutation.mutateAsync(slotId);
        onSlotsUpdate();
      } catch (error) {
        console.error('Failed to delete slot:', error);
        alert('Failed to delete slot. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSlotId(null);
    setFormData({
      date: null,
      start_time: '09:00',
      end_time: '12:00',
      is_active: true,
    });
    setCalendarOpen(false);
  };

  // Group slots by date
  const slotsByDate = slots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    },
    {} as Record<string, AvailableSlot[]>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent mb-4"></div>
        <p className="text-gray-600">Loading availability slots...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add button */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add New Slot
        </Button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingSlotId ? 'Edit Time Slot' : 'Create New Time Slot'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Date picker with Popover */}
            <div>
              <Label htmlFor="date" className="block mb-2">
                Select Date
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-full justify-between font-normal text-gray-900"
                  >
                    {formData.date
                      ? formData.date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Pick a date'}
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date || undefined}
                    onSelect={(date) => {
                      setFormData({ ...formData, date: date || null });
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    defaultMonth={formData.date || undefined}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time" className="block mb-2">
                  Start Time
                </Label>
                <input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <Label htmlFor="end_time" className="block mb-2">
                  End Time
                </Label>
                <input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 rounded cursor-pointer border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                Mark as Active (Available for parent bookings)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={handleCreateOrUpdate}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {editingSlotId ? 'Update Slot' : 'Create Slot'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Slots by date */}
      {slots.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-100">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">No availability slots set up</p>
          <p className="text-gray-500 text-sm">Create time slots to enable parent bookings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(slotsByDate)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, dateSlots]) => {
              const slotDate = new Date(date);
              const formattedDate = slotDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <div
                  key={date}
                  className="bg-white rounded-lg shadow-sm border border-l-4 border-l-blue-500 border-gray-200 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-transparent p-4">
                    <h3 className="font-semibold text-gray-900">{formattedDate}</h3>
                  </div>

                  <div className="divide-y divide-gray-100 p-4 space-y-3">
                    {dateSlots.map((slot: AvailableSlot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="font-semibold text-gray-900 text-sm bg-white px-3 py-1 rounded-md border border-gray-200">
                              {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                            </div>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                slot.is_active
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : 'bg-gray-100 text-gray-700 border border-gray-300'
                              }`}
                            >
                              {slot.is_active ? '✓ Active' : '○ Inactive'}
                            </span>
                            {slot.timezone !== 'UTC' && (
                              <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                                {slot.timezone}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(slot)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit slot"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default SlotManagement;

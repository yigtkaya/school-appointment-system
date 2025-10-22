import { useState } from 'react';
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { useCreateSlotMutation, useUpdateSlotMutation, useDeleteSlotMutation } from '../../hooks';
import type { AvailableSlot } from '../../api/types';

interface SlotManagementProps {
  teacherId: number;
  slots: AvailableSlot[];
  isLoading: boolean;
  onSlotsUpdate: () => void;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface SlotFormData {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

/**
 * Manage teacher availability slots
 * Allows creating, editing, and deleting weekly time slots
 */
export function SlotManagement({
  teacherId,
  slots,
  isLoading,
  onSlotsUpdate,
}: SlotManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [formData, setFormData] = useState<SlotFormData>({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '12:00',
    is_active: true,
  });

  const createMutation = useCreateSlotMutation(teacherId);
  const updateMutation = useUpdateSlotMutation(teacherId);
  const deleteMutation = useDeleteSlotMutation(teacherId);

  const handleCreateOrUpdate = async () => {
    try {
      if (editingSlotId) {
        await updateMutation.mutateAsync({
          slotId: editingSlotId,
          data: {
            day_of_week: formData.day_of_week,
            start_time: `${formData.start_time}:00` as unknown as string,
            end_time: `${formData.end_time}:00` as unknown as string,
            is_active: formData.is_active,
          },
        } as never);
      } else {
        await createMutation.mutateAsync({
          teacher_id: teacherId,
          day_of_week: formData.day_of_week,
          start_time: `${formData.start_time}:00` as unknown as string,
          end_time: `${formData.end_time}:00` as unknown as string,
          timezone: 'UTC',
          is_active: formData.is_active,
        } as never);
      }
      setFormData({
        day_of_week: 0,
        start_time: '09:00',
        end_time: '12:00',
        is_active: true,
      });
      setShowForm(false);
      setEditingSlotId(null);
      onSlotsUpdate();
    } catch (error) {
      console.error('Failed to save slot:', error);
    }
  };

  const handleEdit = (slot: AvailableSlot) => {
    setEditingSlotId(slot.id);
    setFormData({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
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
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSlotId(null);
    setFormData({
      day_of_week: 0,
      start_time: '09:00',
      end_time: '12:00',
      is_active: true,
    });
  };

  // Group slots by day
  const slotsByDay = slots.reduce(
    (acc, slot) => {
      if (!acc[slot.day_of_week]) {
        acc[slot.day_of_week] = [];
      }
      acc[slot.day_of_week].push(slot);
      return acc;
    },
    {} as Record<number, AvailableSlot[]>
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
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add New Slot
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingSlotId ? 'Edit Time Slot' : 'Create New Time Slot'}
          </h3>

          <div className="space-y-4">
            {/* Day selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                value={formData.day_of_week}
                onChange={(e) =>
                  setFormData({ ...formData, day_of_week: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DAYS_OF_WEEK.map((day, idx) => (
                  <option key={idx} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active (Available for booking)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleCreateOrUpdate}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {editingSlotId ? 'Update Slot' : 'Create Slot'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slots by day */}
      {slots.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No availability slots set up</p>
          <p className="text-gray-500 text-sm">Create time slots to enable parent bookings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day, dayIdx) => {
            const daySlotsArray = slotsByDay[dayIdx] || [];

            return (
              <div
                key={dayIdx}
                className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500"
              >
                <h3 className="font-semibold text-gray-900 mb-3">{day}</h3>

                {daySlotsArray.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No slots scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {daySlotsArray.map((slot: AvailableSlot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {slot.start_time} - {slot.end_time}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                slot.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              {slot.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {slot.timezone !== 'UTC' && (
                              <span className="text-xs text-gray-600">{slot.timezone}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(slot)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit slot"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SlotManagement;

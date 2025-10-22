import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useCreateSlotMutation } from '@/hooks';

interface CreateSlotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: number;
  onSlotCreated: () => void;
}

interface SlotFormData {
  date: Date | null;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

/**
 * Modal to create a new availability slot from the schedule view
 */
export function CreateSlotModal({
  open,
  onOpenChange,
  teacherId,
  onSlotCreated,
}: CreateSlotModalProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formData, setFormData] = useState<SlotFormData>({
    date: null,
    start_time: '09:00',
    end_time: '12:00',
    is_active: true,
  });

  const createMutation = useCreateSlotMutation(teacherId);

  const handleCreateSlot = async () => {
    if (!formData.date) {
      alert('Please select a date');
      return;
    }

    if (formData.start_time >= formData.end_time) {
      alert('End time must be after start time');
      return;
    }

    try {
      const dateStr = formData.date.toISOString().split('T')[0];

      await createMutation.mutateAsync({
        teacher_id: teacherId,
        date: dateStr,
        start_time: `${formData.start_time}:00` as unknown as string,
        end_time: `${formData.end_time}:00` as unknown as string,
        timezone: 'UTC',
        is_active: formData.is_active,
      } as never);

      setFormData({
        date: null,
        start_time: '09:00',
        end_time: '12:00',
        is_active: true,
      });
      onOpenChange(false);
      onSlotCreated();
    } catch (error) {
      console.error('Failed to create slot:', error);
      alert('Failed to create slot. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      date: null,
      start_time: '09:00',
      end_time: '12:00',
      is_active: true,
    });
    setCalendarOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Time Slot</DialogTitle>
          <DialogDescription>
            Add a new availability slot for parent bookings
          </DialogDescription>
        </DialogHeader>

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
              onClick={handleCreateSlot}
              disabled={createMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Slot'}
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
      </DialogContent>
    </Dialog>
  );
}

export default CreateSlotModal;

import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Clock, FileText, CheckCircle, AlertCircle, XCircle, Edit2 } from 'lucide-react';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUpdateSlotMutation } from '@/hooks';

interface ScheduleItemDetailModalProps {
  item: ScheduleItemDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId?: number;
  onSlotUpdated?: () => void;
}

export interface ScheduleItemDetail {
  id: string;
  type: 'slot' | 'appointment';
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  status?: string;
  isActive?: boolean;
  // Appointment specific fields
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  studentName?: string;
  studentId?: number;
  classId?: number;
  note?: string;
}

/**
 * Modal to display detailed information about schedule items
 * Shows appointment details including student info or slot information
 * For slots, allows editing of date, time, and active status
 */
export function ScheduleItemDetailModal({
  item,
  open,
  onOpenChange,
  teacherId = 0,
  onSlotUpdated,
}: ScheduleItemDetailModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    date: item?.date || '',
    start_time: item?.startTime || '',
    end_time: item?.endTime || '',
    is_active: item?.isActive ?? true,
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const updateSlotMutation = useUpdateSlotMutation(teacherId);

  // Reset edit form when item changes
  useEffect(() => {
    if (item) {
      setEditFormData({
        date: item.date,
        start_time: item.startTime,
        end_time: item.endTime,
        is_active: item.isActive ?? true,
      });
      setIsEditMode(false);
    }
  }, [item, open]);

  if (!item) return null;

  const getStatusBadge = () => {
    if (item.type === 'slot') {
      return (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            item.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {item.isActive ? '✓ Active' : '○ Inactive'}
        </span>
      );
    } else {
      const statusConfig = {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle },
        confirmed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
        rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
        cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle },
      };
      const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.pending;
      const IconComponent = config.icon;

      return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
          <IconComponent className="w-3 h-3" />
          {(item.status?.charAt(0).toUpperCase() ?? '') + (item.status?.slice(1) ?? '')}
        </span>
      );
    }
  };

  const formatTime = (date: string, time: string) => {
    const fullDateTime = `${date}T${time}`;
    const dateObj = new Date(fullDateTime);
    return dateObj.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // This is kept for potential future use or API logging
  void formatTime;

  const handleSaveSlot = async () => {
    if (item.type !== 'slot' || !item.id) return;

    const slotId = parseInt(item.id.split('-')[1]);
    if (editFormData.start_time >= editFormData.end_time) {
      alert('End time must be after start time');
      return;
    }

    try {
      await updateSlotMutation.mutateAsync({
        slotId,
        data: {
          date: editFormData.date,
          start_time: `${editFormData.start_time}:00`,
          end_time: `${editFormData.end_time}:00`,
          is_active: editFormData.is_active,
        },
      } as never);
      
      setIsEditMode(false);
      onSlotUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update slot:', error);
      alert('Failed to update slot. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-lg">
                {item.type === 'slot' ? 'Available Slot' : 'Appointment Details'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {item.type === 'slot'
                  ? 'Time slot availability information'
                  : `Meeting with ${item.parentName}`}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {item.type === 'slot' && !isEditMode && (
                <Button
                  onClick={() => setIsEditMode(true)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                  title="Edit slot"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              <div>{getStatusBadge()}</div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Time</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {item.startTime} - {item.endTime}
                </span>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          {item.type === 'appointment' && (
            <>
              {/* Parent Information */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900">Parent Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 font-medium min-w-fit">Name:</span>
                    <span className="text-gray-900 font-medium">{item.parentName}</span>
                  </div>
                  {item.parentEmail && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href={`mailto:${item.parentEmail}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {item.parentEmail}
                      </a>
                    </div>
                  )}
                  {item.parentPhone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a
                        href={`tel:${item.parentPhone}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {item.parentPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Information */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900">Student Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 font-medium min-w-fit">Student ID:</span>
                    <span className="text-gray-900">{item.studentId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 font-medium min-w-fit">Class ID:</span>
                    <span className="text-gray-900">{item.classId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {item.note && (
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.note}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Slot Details */}
          {item.type === 'slot' && !isEditMode && (
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900">Slot Information</h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-gray-900">
                    {item.isActive ? 'Available for booking' : 'Not available'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">
                    {(() => {
                      const [startHours, startMins] = item.startTime.split(':').map(Number);
                      const [endHours, endMins] = item.endTime.split(':').map(Number);
                      const startTotal = startHours * 60 + startMins;
                      const endTotal = endHours * 60 + endMins;
                      const durationMins = endTotal - startTotal;
                      const hours = Math.floor(durationMins / 60);
                      const mins = durationMins % 60;
                      return `${hours}h ${mins}m`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Slot Edit Form */}
          {item.type === 'slot' && isEditMode && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900">Edit Slot</h3>
              
              {/* Date Picker */}
              <div className="space-y-2">
                <Label htmlFor="slot-date" className="text-sm font-medium">
                  Date
                </Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {editFormData.date || 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={editFormData.date ? new Date(editFormData.date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setEditFormData(prev => ({
                            ...prev,
                            date: date.toISOString().split('T')[0]
                          }));
                          setCalendarOpen(false);
                        }
                      }}
                      disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start-time" className="text-sm font-medium">
                    Start Time
                  </Label>
                  <input
                    id="start-time"
                    type="time"
                    value={editFormData.start_time}
                    onChange={(e) =>
                      setEditFormData(prev => ({
                        ...prev,
                        start_time: e.target.value
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time" className="text-sm font-medium">
                    End Time
                  </Label>
                  <input
                    id="end-time"
                    type="time"
                    value={editFormData.end_time}
                    onChange={(e) =>
                      setEditFormData(prev => ({
                        ...prev,
                        end_time: e.target.value
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  id="is-active"
                  type="checkbox"
                  checked={editFormData.is_active}
                  onChange={(e) =>
                    setEditFormData(prev => ({
                      ...prev,
                      is_active: e.target.checked
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is-active" className="text-sm font-medium cursor-pointer">
                  Available for booking
                </Label>
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveSlot}
                  disabled={updateSlotMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updateSlotMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => setIsEditMode(false)}
                  disabled={updateSlotMutation.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ScheduleItemDetailModal;

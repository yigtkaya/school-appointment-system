import { Mail, Phone, Calendar, Clock, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ScheduleItemDetailModalProps {
  item: ScheduleItemDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
 */
export function ScheduleItemDetailModal({
  item,
  open,
  onOpenChange,
}: ScheduleItemDetailModalProps) {
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
            <div>{getStatusBadge()}</div>
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
          {item.type === 'slot' && (
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ScheduleItemDetailModal;

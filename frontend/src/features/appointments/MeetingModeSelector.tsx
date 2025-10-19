import { Video, MapPin, Check } from 'lucide-react'
import { MeetingMode } from '@/types/api'
import { cn } from '@/lib/utils'

interface MeetingModeSelectorProps {
  selectedMode: MeetingMode | null
  onModeSelect: (mode: MeetingMode) => void
  disabled?: boolean
}

const MEETING_OPTIONS = [
  {
    mode: MeetingMode.ONLINE,
    title: 'Online Meeting',
    description: 'Video call via preferred platform',
    icon: Video,
  },
  {
    mode: MeetingMode.FACE_TO_FACE,
    title: 'Face-to-Face',
    description: 'In-person meeting at school',
    icon: MapPin,
  }
] as const

export function MeetingModeSelector({ 
  selectedMode, 
  onModeSelect, 
  disabled = false 
}: MeetingModeSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Video className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Choose Meeting Format</h3>
        </div>
        <p className="text-sm text-gray-600">
          Select how you'd like to conduct the appointment with the teacher.
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid gap-3">
        {MEETING_OPTIONS.map(({ mode, title, description, icon: Icon }) => {
          const isSelected = selectedMode === mode
          
          return (
            <button
              key={mode}
              onClick={() => !disabled && onModeSelect(mode)}
              disabled={disabled}
              className={cn(
                "relative text-left px-4 py-3 rounded-lg border-2 transition-all",
                "flex items-start gap-3",
                isSelected 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5",
                isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{title}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Info Section */}
      <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Quick Info</h4>
        <ul className="space-y-2 text-xs text-gray-600">
          <li className="flex items-start gap-2">
            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
            <span>Online meetings include connection details in the confirmation email</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
            <span>Face-to-face meetings are held at the teacher's office or designated room</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
            <span>You can change the format up to 24 hours before the appointment</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
    features: [
      'Convenient from anywhere',
      'Screen sharing available',
      'Recording possible',
      'No travel required'
    ],
    badge: 'Recommended'
  },
  {
    mode: MeetingMode.FACE_TO_FACE,
    title: 'Face-to-Face',
    description: 'In-person meeting at school',
    icon: MapPin,
    features: [
      'Personal interaction',
      'Document sharing',
      'Private discussion',
      'Better engagement'
    ],
    badge: null
  }
] as const

export function MeetingModeSelector({ 
  selectedMode, 
  onModeSelect, 
  disabled = false 
}: MeetingModeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Choose Meeting Format
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select how you'd like to conduct the appointment with the teacher.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {MEETING_OPTIONS.map(({ mode, title, description, icon: Icon, features, badge }) => {
            const isSelected = selectedMode === mode
            
            return (
              <div
                key={mode}
                className={cn(
                  "relative border rounded-lg p-4 transition-all cursor-pointer",
                  isSelected 
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20" 
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !disabled && onModeSelect(mode)}
              >
                {badge && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 right-2 text-xs"
                  >
                    {badge}
                  </Badge>
                )}
                
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full",
                    isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{title}</h3>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{description}</p>
                    
                    <ul className="space-y-1">
                      {features.map((feature, index) => (
                        <li 
                          key={index}
                          className="flex items-center gap-2 text-xs text-gray-500"
                        >
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
                )}
              </div>
            )
          })}
        </div>

        {selectedMode && (
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Selected Format</h4>
            <div className="text-sm text-blue-800">
              <p className="font-medium">
                {MEETING_OPTIONS.find(opt => opt.mode === selectedMode)?.title}
              </p>
              <p className="text-blue-600">
                {MEETING_OPTIONS.find(opt => opt.mode === selectedMode)?.description}
              </p>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">Important Notes</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2" />
              <span>
                Online meetings will include connection details in the confirmation email
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2" />
              <span>
                Face-to-face meetings will be held at the teacher's office or designated room
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2" />
              <span>
                You can change the meeting format up to 24 hours before the appointment
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
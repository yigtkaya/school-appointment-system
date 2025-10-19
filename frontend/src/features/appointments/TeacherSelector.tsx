import { Card, CardContent } from '@/components/ui/card'
import type { Teacher } from '@/types/api'

interface TeacherSelectorProps {
  teachers: Teacher[]
  isLoading: boolean
  selectedTeacher: Teacher | null
  onTeacherSelect: (teacher: Teacher) => void
}

export function TeacherSelector({
  teachers,
  isLoading,
  selectedTeacher,
  onTeacherSelect,
}: TeacherSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {teachers.map((teacher) => (
        <Card
          key={teacher.id}
          className={`cursor-pointer transition-all ${
            selectedTeacher?.id === teacher.id
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onTeacherSelect(teacher)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{teacher.user.full_name}</h4>
                <p className="text-sm text-gray-600">{teacher.subject}</p>
                {teacher.branch && (
                  <p className="text-xs text-gray-500">{teacher.branch}</p>
                )}
              </div>
              {selectedTeacher?.id === teacher.id && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

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
          <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {teachers.map((teacher) => (
        <button
          key={teacher.id}
          onClick={() => onTeacherSelect(teacher)}
          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
            selectedTeacher?.id === teacher.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{teacher.user.full_name}</h4>
              <p className="text-sm text-gray-600 mt-0.5">{teacher.subject}</p>
              {teacher.branch && (
                <p className="text-xs text-gray-500 mt-1">{teacher.branch}</p>
              )}
            </div>
            {selectedTeacher?.id === teacher.id && (
              <div className="ml-3 flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

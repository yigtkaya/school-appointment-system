import { WeeklyScheduleView } from '../admin/WeeklyScheduleView'
import type { Teacher } from '@/types/api'
import { useSlots } from '@/hooks'
import { useAuthStore } from '@/stores/auth'
import { useTeacherByUserId } from '@/hooks/teachers'

export function TeacherSlotManagement() {

  const { user } = useAuthStore()

  // Fetch teacher data for the current user
  const { data: teacherData } = useTeacherByUserId(user?.id || '')
  const teacher = teacherData as Teacher | undefined

  // Get teacher's own slots only
  const { isLoading: slotsLoading, error: slotsError } = useSlots({
    teacher_id: teacher?.id,
    limit: 100,
  })


  if (!teacher) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="text-yellow-700">
          Teacher profile not found. Please contact an administrator.
        </div>
      </div>
    )
  }

  if (slotsLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading your slots...</div>
      </div>
    )
  }

  if (slotsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-red-700">
          Error loading slots: {slotsError instanceof Error ? slotsError.message : 'Unknown error'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <WeeklyScheduleView
        selectedTeacher={teacher.id}
        onTeacherChange={() => { }}
      />
    </div>
  )
}
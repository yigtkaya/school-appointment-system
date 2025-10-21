import { WeeklyScheduleView } from '../admin/WeeklyScheduleView'
import type { Teacher } from '@/types/api'
import { useSlots } from '@/hooks'
import { useAuthStore } from '@/stores/auth'
import { useTeacherByUserId } from '@/hooks/teachers'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TeacherSlotManagementProps {
  onBackToDashboard?: () => void
}

export function TeacherSlotManagement({ onBackToDashboard }: TeacherSlotManagementProps) {
  const { t } = useTranslation()
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
          {t('teacher.slotManagement.profileNotFound')}
        </div>
      </div>
    )
  }

  if (slotsLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center">
        <div className="text-gray-500">{t('teacher.slotManagement.loadingSlots')}</div>
      </div>
    )
  }

  if (slotsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-red-700">
          {t('teacher.slotManagement.errorLoadingSlots')}: {slotsError instanceof Error ? slotsError.message : 'Unknown error'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {onBackToDashboard && (
        <Button
          variant="ghost"
          onClick={onBackToDashboard}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('teacher.slotManagement.backToDashboard')}
        </Button>
      )}
      <WeeklyScheduleView
        selectedTeacher={teacher.id}
        onTeacherChange={() => { }}
      />
    </div>
  )
}
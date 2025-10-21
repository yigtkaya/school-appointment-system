import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { teachersAPI } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { Teacher } from '@/types/api'


type EditTeacherFormData = {
  subject: string
  branch?: string
  bio?: string
}

interface TeacherEditFormProps {
  teacher: Teacher
  onClose: () => void
  onSuccess: () => void
}

export function TeacherEditForm({ teacher, onClose, onSuccess }: TeacherEditFormProps) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)

  const editTeacherSchema = z.object({
    subject: z.string().min(1, t('admin.teacherEdit.validation.subjectRequired')),
    branch: z.string().optional(),
    bio: z.string().optional(),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditTeacherFormData>({
    resolver: zodResolver(editTeacherSchema),
    defaultValues: {
      subject: teacher.subject,
      branch: teacher.branch || '',
      bio: teacher.bio || '',
    },
  })

  const updateTeacherMutation = useMutation({
    mutationFn: (data: EditTeacherFormData) => 
      teachersAPI.update(teacher.id, {
        subject: data.subject,
        branch: data.branch || undefined,
        bio: data.bio || undefined,
      }),
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : t('admin.teacherEdit.errors.failedToUpdate'))
    },
  })

  const onSubmit = (data: EditTeacherFormData) => {
    setError(null)
    updateTeacherMutation.mutate(data)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('admin.teacherEdit.title')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          {t('admin.teacherEdit.editing')} {teacher.user?.full_name} ({teacher.user?.email})
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.teacherEdit.subject')} *
              </label>
              <input
                {...register('subject')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('admin.teacherEdit.subjectPlaceholder')}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.teacherEdit.branch')}
              </label>
              <input
                {...register('branch')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('admin.teacherEdit.branchPlaceholder')}
              />
              {errors.branch && (
                <p className="mt-1 text-sm text-red-600">{errors.branch.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.teacherEdit.bio')}
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('admin.teacherEdit.bioPlaceholder')}
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('admin.teacherEdit.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={updateTeacherMutation.isPending}
            >
              {updateTeacherMutation.isPending ? t('admin.teacherEdit.updating') : t('admin.teacherEdit.updateTeacher')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
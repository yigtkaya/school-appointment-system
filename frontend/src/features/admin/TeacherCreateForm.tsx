import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { teachersAPI, usersAPI, UserRole } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'


type CreateTeacherFormData = z.infer<typeof createTeacherSchema>

interface TeacherCreateFormProps {
  onClose: () => void
  onSuccess: () => void
}

export function TeacherCreateForm({ onClose, onSuccess }: TeacherCreateFormProps) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)

  const createTeacherSchema = z.object({
    email: z.email(t('admin.teacherCreate.validation.validEmail')),
    password: z.string().min(6, t('admin.teacherCreate.validation.passwordMin')),
    full_name: z.string().min(1, t('admin.teacherCreate.validation.fullNameRequired')),
    subject: z.string().min(1, t('admin.teacherCreate.validation.subjectRequired')),
    branch: z.string().optional(),
    bio: z.string().optional(),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeacherFormData>({
    resolver: zodResolver(createTeacherSchema),
  })

  const createTeacherMutation = useMutation({
    mutationFn: async (data: CreateTeacherFormData) => {
      // First create the user using admin endpoint
      const user = await usersAPI.create({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: UserRole.TEACHER,
      })

      // Then create the teacher profile
      return teachersAPI.create({
        user_id: user.id,
        subject: data.subject,
        branch: data.branch || undefined,
        bio: data.bio || undefined,
      })
    },
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : t('admin.teacherCreate.errors.failedToCreate'))
    },
  })

  const onSubmit = (data: CreateTeacherFormData) => {
    setError(null)
    createTeacherMutation.mutate(data)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('admin.teacherCreate.title')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
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
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.teacherCreate.fullName')} *
              </label>
              <input
                {...register('full_name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('admin.teacherCreate.fullNamePlaceholder')}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.teacherCreate.emailAddress')} *
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('admin.teacherCreate.emailPlaceholder')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.teacherCreate.password')} *
            </label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('admin.teacherCreate.passwordPlaceholder')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.teacherCreate.subject')} *
              </label>
              <input
                {...register('subject')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('admin.teacherCreate.subjectPlaceholder')}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.teacherCreate.branch')}
              </label>
              <input
                {...register('branch')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('admin.teacherCreate.branchPlaceholder')}
              />
              {errors.branch && (
                <p className="mt-1 text-sm text-red-600">{errors.branch.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.teacherCreate.bio')}
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('admin.teacherCreate.bioPlaceholder')}
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('admin.teacherCreate.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={createTeacherMutation.isPending}
            >
              {createTeacherMutation.isPending ? t('admin.teacherCreate.creating') : t('admin.teacherCreate.createTeacher')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
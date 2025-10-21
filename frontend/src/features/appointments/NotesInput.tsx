import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface NotesInputProps {
  register: UseFormRegisterReturn
  error?: FieldError
  value: string | undefined
}

export function NotesInput({ register, error, value }: NotesInputProps) {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t('appointments.notesSection.additionalNotes')}</h3>
        <p className="text-sm text-gray-600">
          {t('appointments.notesSection.notesDesc')}
        </p>
      </div>
      
      <textarea
        {...register}
        placeholder={t('appointments.notesSection.notesPlaceholder')}
        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        maxLength={500}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
      
      <div className="flex justify-end">
        <span className="text-xs text-gray-500">
          {t('appointments.notesSection.charactersRemaining', { count: value?.length || 0 })}
        </span>
      </div>
    </div>
  )
}

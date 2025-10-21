import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export interface ChildInfoFormData {
  child_name: string
  child_year: string
  child_class: string
  parent_contact?: string
}

interface ChildInfoFormProps {
  register: UseFormRegister<ChildInfoFormData>
  errors: FieldErrors<ChildInfoFormData>
  values: ChildInfoFormData
}

const YEARS = ['1', '2', '3', '4', '5', '6', '7', '8']
const CLASSES = ['A', 'B', 'C', 'D', 'E']

export function ChildInfoForm({ register, errors, values }: ChildInfoFormProps) {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t('appointments.modal.studentInformation')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('appointments.modal.studentInformationDesc')}
        </p>
      </div>

      {/* Child Name */}
      <div className="space-y-2">
        <label htmlFor="child_name" className="text-sm font-medium">
          {t('appointments.modal.studentName')} <span className="text-red-500">*</span>
        </label>
        <input
          id="child_name"
          type="text"
          {...register('child_name')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('appointments.modal.studentNamePlaceholder')}
        />
        {errors.child_name && (
          <p className="text-sm text-red-500">{errors.child_name.message}</p>
        )}
      </div>

      {/* Year and Class in a row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Year Selection */}
        <div className="space-y-2">
          <label htmlFor="child_year" className="text-sm font-medium">
            {t('appointments.modal.year')} <span className="text-red-500">*</span>
          </label>
          <select
            id="child_year"
            {...register('child_year')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('appointments.modal.selectYear')}</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {t('appointments.modal.year')} {year}
              </option>
            ))}
          </select>
          {errors.child_year && (
            <p className="text-sm text-red-500">{errors.child_year.message}</p>
          )}
        </div>

        {/* Class Selection */}
        <div className="space-y-2">
          <label htmlFor="child_class" className="text-sm font-medium">
            {t('appointments.modal.class')} <span className="text-red-500">*</span>
          </label>
          <select
            id="child_class"
            {...register('child_class')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('appointments.modal.selectClass')}</option>
            {CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                {t('appointments.modal.class')} {cls}
              </option>
            ))}
          </select>
          {errors.child_class && (
            <p className="text-sm text-red-500">{errors.child_class.message}</p>
          )}
        </div>
      </div>

      {/* Parent Contact (Optional) */}
      <div className="space-y-2">
        <label htmlFor="parent_contact" className="text-sm font-medium">
          {t('appointments.modal.parentContact')} <span className="text-gray-400">({t('appointments.modal.parentContactOptional')})</span>
        </label>
        <input
          id="parent_contact"
          type="text"
          {...register('parent_contact')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('appointments.modal.parentContactPlaceholder')}
        />
        <p className="text-xs text-muted-foreground">
          {t('appointments.modal.parentContactDesc')}
        </p>
        {errors.parent_contact && (
          <p className="text-sm text-red-500">{errors.parent_contact.message}</p>
        )}
      </div>

      {/* Summary Display */}
      {values.child_name && values.child_year && values.child_class && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-medium text-blue-900">{t('appointments.modal.bookingFor')}</p>
          <p className="text-sm text-blue-800">
            {values.child_name} - {t('appointments.modal.yearClass', { year: values.child_year, class: values.child_class })}
          </p>
          {values.parent_contact && (
            <p className="text-sm text-blue-700 mt-1">
              {t('appointments.modal.contact')} {values.parent_contact}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

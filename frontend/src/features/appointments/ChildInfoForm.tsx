import type { UseFormRegister, FieldErrors } from 'react-hook-form'

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
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Student Information</h3>
        <p className="text-sm text-muted-foreground">
          Please provide the student's details to complete the booking.
        </p>
      </div>

      {/* Child Name */}
      <div className="space-y-2">
        <label htmlFor="child_name" className="text-sm font-medium">
          Student Name <span className="text-red-500">*</span>
        </label>
        <input
          id="child_name"
          type="text"
          {...register('child_name')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter student's full name"
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
            Year <span className="text-red-500">*</span>
          </label>
          <select
            id="child_year"
            {...register('child_year')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Year</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                Year {year}
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
            Class <span className="text-red-500">*</span>
          </label>
          <select
            id="child_class"
            {...register('child_class')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Class</option>
            {CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
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
          Parent Contact <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          id="parent_contact"
          type="text"
          {...register('parent_contact')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email or phone number"
        />
        <p className="text-xs text-muted-foreground">
          Provide an email or phone number for appointment updates.
        </p>
        {errors.parent_contact && (
          <p className="text-sm text-red-500">{errors.parent_contact.message}</p>
        )}
      </div>

      {/* Summary Display */}
      {values.child_name && values.child_year && values.child_class && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-medium text-blue-900">Booking for:</p>
          <p className="text-sm text-blue-800">
            {values.child_name} - Year {values.child_year}, Class {values.child_class}
          </p>
          {values.parent_contact && (
            <p className="text-sm text-blue-700 mt-1">
              Contact: {values.parent_contact}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

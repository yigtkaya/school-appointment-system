import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface NotesInputProps {
  register: UseFormRegisterReturn
  error?: FieldError
  value: string | undefined
}

export function NotesInput({ register, error, value }: NotesInputProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold mb-1">Additional Notes</h3>
        <p className="text-sm text-gray-600">
          Share any specific topics or questions you'd like to discuss (optional).
        </p>
      </div>
      
      <textarea
        {...register}
        placeholder="Enter any additional notes or specific topics you'd like to discuss..."
        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        maxLength={500}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
      
      <div className="flex justify-end">
        <span className="text-xs text-gray-500">
          {value?.length || 0}/500 characters
        </span>
      </div>
    </div>
  )
}

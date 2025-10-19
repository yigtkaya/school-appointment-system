import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface NotesInputProps {
  register: UseFormRegisterReturn
  error?: FieldError
  value: string | undefined
}

export function NotesInput({ register, error, value }: NotesInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Notes (Optional)</CardTitle>
        <p className="text-sm text-gray-600">
          Share any specific topics or questions you'd like to discuss.
        </p>
      </CardHeader>
      <CardContent>
        <textarea
          {...register}
          placeholder="Enter any additional notes or specific topics you'd like to discuss..."
          className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={500}
        />
        {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {value?.length || 0}/500 characters
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

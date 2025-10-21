import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Clock, Calendar, CheckCircle } from 'lucide-react'

interface StatsCardsProps {
  pending: number
  today: number
  total: number
  confirmed: number
}

export function StatsCards({ pending, today, total, confirmed }: StatsCardsProps) {
  const { t } = useTranslation()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.pendingAppointments')}</p>
              <p className="text-2xl font-bold">{pending}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('common.today')}</p>
              <p className="text-2xl font-bold">{today}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.allAppointments')}</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('appointments.status.confirmed')}</p>
              <p className="text-2xl font-bold">{confirmed}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

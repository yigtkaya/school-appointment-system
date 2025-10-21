import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {  Settings } from 'lucide-react'

interface QuickActionsProps {
  onManageSlots?: () => void
}

export function QuickActionsCard({ onManageSlots }: QuickActionsProps) {
  const { t } = useTranslation()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {onManageSlots && (
          <Button onClick={onManageSlots} variant="outline" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            {t('teacher.slotManagement.manageYourSlots')}
          </Button>
        )}
        <div className="text-sm text-gray-600 space-y-2">
          <div>• {t('appointments.confirm')}</div>
          <div>• {t('common.today')}</div>
          <div>• {t('slot.management')}</div>
          <div>• {t('appointments.details')}</div>
        </div>
      </CardContent>
    </Card>
  )
}

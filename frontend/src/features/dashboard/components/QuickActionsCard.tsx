import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {  Settings } from 'lucide-react'

interface QuickActionsProps {
  onManageSlots?: () => void
}

export function QuickActionsCard({ onManageSlots }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {onManageSlots && (
          <Button onClick={onManageSlots} variant="outline" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Manage Availability
          </Button>
        )}
        <div className="text-sm text-gray-600 space-y-2">
          <div>• Confirm or reject pending appointments above</div>
          <div>• Check today's schedule on the left</div>
          <div>• Manage your availability slots</div>
          <div>• View detailed appointment information</div>
        </div>
      </CardContent>
    </Card>
  )
}

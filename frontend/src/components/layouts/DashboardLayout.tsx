import { type ReactNode } from 'react' 
import { useAuthStore } from '@/stores/auth'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation()
  const { user, logout, isAuthenticated } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    // Redirect to home page after logout
    router.navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  {t('auth.login.title')}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {t('dashboard.welcome')}, {user?.full_name || user?.email}
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {user?.role}
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  {t('auth.logout')}
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="max-w mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  )
}
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useLogin } from '@/hooks/auth'

type LoginFormData = {
  email: string
  password: string
}

export function LoginForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = useSearch({ from: '/login' })
  const loginMutation = useLogin()
  
  const loginSchema = z.object({
    email: z.email(t('auth.login.validation.emailRequired')),
    password: z.string().min(1, t('auth.login.validation.passwordRequired')),
  })
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
      await loginMutation.mutateAsync(data)
      // Navigate to the intended destination or dashboard
      navigate({ to: search.redirect || '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.login.title')}</h1>
            <h2 className="text-sm font-semibold text-gray-600">{t('auth.login.subtitle')}</h2>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {loginMutation.error && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  {loginMutation.error instanceof Error ? loginMutation.error.message : t('auth.login.loginFailed')}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.login.emailLabel')}
                </label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={t('auth.login.emailPlaceholder')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.login.passwordLabel')}
                </label>
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  placeholder={t('auth.login.passwordPlaceholder')}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? t('auth.login.signingIn') : t('auth.login.signInButton')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              <span className="font-semibold block mb-2 text-gray-700">{t('auth.login.demoCredentials')}</span>
              <span className="text-blue-600 font-medium">{t('auth.login.admin')}</span> admin@school.com<br />
              <span className="text-red-600 font-medium">{t('auth.login.teacher')}</span> teacher@school.com<br />
              <span className="block mt-2"><span className="font-semibold text-gray-700">{t('auth.login.password')}</span> password123</span>
            </p>
          </div>
        </div>
      </div>
</div>
  )
}
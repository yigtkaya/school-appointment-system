
import { useNavigate } from '@tanstack/react-router'
import { useLogin } from '@/hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema } from "@/lib/schemas";
import { useForm } from 'react-hook-form';

type LoginFormData = {
  username_or_email: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
      await loginMutation.mutateAsync(data)
      // Navigate to the intended destination or dashboard
      navigate({ to: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Giriş Yapınız</h1>
            <h2 className="text-sm font-semibold text-gray-600">Lütfen giriş bilgilerinizi girin  </h2>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {loginMutation.error && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  {loginMutation.error instanceof Error ? loginMutation.error.message : 'Giriş başarısız oldu'}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username_or_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Kullanıcı Adı veya Email
                </label>
                <input
                  {...register('username_or_email')}
                  type="text"
                  autoComplete="username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="ozge.cavlak veya ozge@example.com"
                />
                {errors.username_or_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.username_or_email.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre
                </label>
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  placeholder="Şifre"
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
              {loginMutation.isPending ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              <span className="font-semibold block mb-3 text-gray-700">Demo Hesap Bilgileri</span>
              <div className="space-y-2">
                <div>
                  <span className="text-blue-600 font-medium">Admin</span><br />
                  Kullanıcı Adı: <span className="font-mono bg-gray-100 px-1 rounded">admin</span><br />
                  Email: <span className="font-mono bg-gray-100 px-1 rounded">admin@school.com</span>
                </div>
                <div>
                  <span className="text-red-600 font-medium">Öğretmen</span><br />
                  Kullanıcı Adı: <span className="font-mono bg-gray-100 px-1 rounded">ozge.cavlak</span><br />
                  Email: <span className="font-mono bg-gray-100 px-1 rounded">teacher@school.com</span>
                </div>
                <div className="pt-2 border-t border-gray-300">
                  <span className="font-semibold text-gray-700">Şifre</span><br />
                  <span className="font-mono bg-gray-100 px-1 rounded">password123</span>
                </div>
              </div>
            </p>
          </div>
        </div>
      </div>
</div>
  )
}
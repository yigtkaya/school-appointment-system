import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Calendar, Users, CheckCircle, ArrowRight, Zap, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-red-900">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 border-b transition-all duration-300 ${isScrolled ? 'bg-white bg-opacity-70 backdrop-blur-lg shadow-lg border-gray-200' : 'bg-white bg-opacity-100 shadow-md border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/bahcesehir-logo.jpg" alt="Bahçeşehir Koleji" className="h-12 w-auto flex-shrink-0" />
            <div>
              <span className="text-lg font-bold text-blue-900">Bahçeşehir Koleji</span>
              <div className="text-xs text-gray-600">Randevu Sistemi</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="text-gray-700 border-gray-300">Personel Giriş</Button>
            </Link>
            <a href="/parent">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">Randevu Al</Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <img src="/bahcesehir-logo.jpg" alt="Bahçeşehir Koleji" className="h-24 w-auto flex-shrink-0" />
                <div>
                  <h1 className="text-4xl font-bold leading-tight text-white">
                    Bahçeşehir Koleji
                  </h1>
                  <p className="text-red-200">Randevu Sistemi</p>
                </div>
              </div>
              <div>
                <h2 className="text-5xl lg:text-5xl font-bold mb-6 leading-tight text-white">
                  Veli-Öğretmen Görüşmelerini
                  <span className="block text-red-300"> Kolayca Planlayın</span>
                </h2>
                <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                  Çocuğunuzun veli-öğretmen görüşmelerini saniyeler içinde rezerv edin. Veliler için giriş gerektirmez, öğretmenler için basit yönetim, yöneticiler için tam kontrol.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/parent">
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white text-base font-semibold px-8 group shadow-lg">
                    <Calendar className="mr-2 h-5 w-5" />
                    <a href="/parent">  
                    Şimdi Randevu Al
                    </a>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <Link to="/login">
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100 text-base font-semibold px-8 shadow-lg">
                    Personel Portalı
                  </Button>
                </Link>
              </div>

              <div className="flex gap-8 text-sm text-blue-50 flex-wrap">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-red-300 flex-shrink-0" />
                  <span>Ücretsiz & Kolay</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-red-300 flex-shrink-0" />
                  <span>Anında Rezervasyon</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-red-300 flex-shrink-0" />
                  <span>Güvenli</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-300 rounded-2xl opacity-5 blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-blue-800 to-red-800 rounded-2xl p-8 border-2 border-red-600 shadow-xl">
                <div className="flex justify-center mb-6">
                  <svg width="120" height="120" viewBox="0 0 100 100">
                    {/* Red sun rays */}
                    <path d="M50 15 L55 35 L60 20 L58 40 L70 25 L60 35 L75 40 L60 40 L70 55 L55 45 L60 60 L50 45 L40 60 L45 45 L30 55 L40 40 L25 40 L40 35 L30 25 L42 40 L45 20 L50 35 Z" fill="#FF6B6B"/>
                    {/* Blue triangle */}
                    <polygon points="30,50 50,75 70,50" fill="#4DA6FF"/>
                  </svg>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-700 rounded-lg p-4 space-y-2">
                    <div className="h-3 bg-blue-600 rounded w-3/4"></div>
                    <div className="h-2 bg-blue-600 rounded w-1/2"></div>
                  </div>
                  <div className="bg-blue-700 rounded-lg p-4 space-y-2">
                    <div className="h-3 bg-blue-600 rounded w-4/5"></div>
                    <div className="h-2 bg-blue-600 rounded w-2/3"></div>
                  </div>
                  <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-lg p-4">
                    <div className="h-3 bg-red-700 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Neden Bahçeşehir Koleji Randevu Sistemi?
            </h2>
            <p className="text-xl text-gray-100">
              Tüm taraflar için tasarlanmış, basit ve güvenli çözüm
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Şimdi Rezerv Edin",
                description: "Veliler giriş yapmadan anında randevu alabilir. Sistem hemen güncellenir.",
                bgColor: "bg-red-600",
                borderColor: "border-red-500",
                iconColor: "text-white",
                accentColor: "bg-white"
              },
              {
                icon: Shield,
                title: "Güvenli & Organize",
                description: "Tüm veriler şifreli ve güvenli tutulur. Öğretmenler kolayca takvimlerini yönetebilir.",
                bgColor: "bg-blue-600",
                borderColor: "border-blue-500",
                iconColor: "text-white",
                accentColor: "bg-white"
              },
              {
                icon: CheckCircle,
                title: "Akıllı Yönetim",
                description: "Yöneticiler rapor alabilir, sistem otomatik olarak hatırlatmalar gönderir.",
                bgColor: "bg-purple-600",
                borderColor: "border-purple-500",
                iconColor: "text-white",
                accentColor: "bg-white"
              }
            ].map((feature, i) => (
              <div key={i} className={`${feature.bgColor} bg-opacity-20 backdrop-blur-sm border-2 ${feature.borderColor} rounded-xl p-8 hover:shadow-xl transition-all hover:-translate-y-1 hover:bg-opacity-30`}>
                <div className={`mb-4 w-14 h-14 rounded-lg ${feature.accentColor} bg-opacity-20 flex items-center justify-center`}>
                  <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Nasıl Çalışır? / How It Works</h2>
            <p className="text-xl text-gray-100">Randevu almak için üç basit adım / Three simple steps to book your appointment</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Bilgileri Girin</h3>
              <p className="text-red-200 font-semibold mb-2">Enter Details</p>
              <p className="text-gray-200 text-sm">
                Çocuğunuzun adı, sınıfı ve görüşmek istediğiniz konu hakkında bilgi verin.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Zaman Seçin</h3>
              <p className="text-blue-200 font-semibold mb-2">Choose Time</p>
              <p className="text-gray-200 text-sm">
                Sizin takvimle uyumlu olan öğretmen sınıflarından seçim yapın.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-blue-600 text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                ✓
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Tamamlandı!</h3>
              <p className="text-yellow-300 font-semibold mb-2">Confirmed!</p>
              <p className="text-gray-200 text-sm">
                Anında onay alın ve toplantı ayrıntılarını bildirimleri aracılığıyla görün.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Herkes için</h2>
            <p className="text-xl text-gray-100">Okulunuzdaki her rol için tasarlanmıştır</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Parents */}
            <div className="group">
              <div className="bg-gradient-to-br from-blue-900 to-red-900 bg-opacity-30 backdrop-blur-md rounded-2xl p-8 border-2 border-red-500 border-opacity-50 hover:border-opacity-100 transition-all duration-300 h-full shadow-lg hover:shadow-2xl hover:bg-opacity-50 hover:-translate-y-2 group-hover:scale-105 flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-red-200 transition-colors duration-300">Veliler</h3>
                <p className="text-sm text-gray-200 mb-4 group-hover:text-red-100 transition-colors duration-300">Ebeveyn Randevu Sistemi</p>
                <ul className="space-y-3 mb-8 text-gray-100 flex-grow">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
                    <span>Giriş gerekmez</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
                    <span>Saniyeler içinde rezerv / Book in seconds</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
                    <span>Tüm randevuları göz at / View all appointments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
                    <span>Bildirim al / Receive notifications</span>
                  </li>
                </ul>
                <a href="/parent" className="w-full">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                    Randevu Al / Book Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Teachers */}
            <div className="group">
              <div className="bg-gradient-to-br from-blue-900 to-red-900 bg-opacity-30 backdrop-blur-md rounded-2xl p-8 border-2 border-blue-400 border-opacity-50 hover:border-opacity-100 transition-all duration-300 h-full shadow-lg hover:shadow-2xl hover:bg-opacity-50 hover:-translate-y-2 group-hover:scale-105 flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors duration-300">Öğretmenler / Teachers</h3>
                <p className="text-sm text-gray-200 mb-4 group-hover:text-blue-100 transition-colors duration-300">Ders Saati Yönetimi</p>
                <ul className="space-y-3 mb-8 text-gray-100 flex-grow">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
                    <span>Müsaitliği yönet / Manage availability</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
                    <span>İstekleri göz at / View requests</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
                    <span>Toplantıları onayla/reddet / Confirm/Reject meetings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
                    <span>Takvimi izle / Track schedule</span>
                  </li>
                </ul>
                <Link to="/login" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                    Öğretmen Girişi / Teacher Login
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Admins */}
            <div className="group">
              <div className="bg-gradient-to-br from-blue-900 to-red-900 bg-opacity-30 backdrop-blur-md rounded-2xl p-8 border-2 border-purple-400 border-opacity-50 hover:border-opacity-100 transition-all duration-300 h-full shadow-lg hover:shadow-2xl hover:bg-opacity-50 hover:-translate-y-2 group-hover:scale-105 flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-200 transition-colors duration-300">İdari / Admins</h3>
                <p className="text-sm text-gray-200 mb-4 group-hover:text-yellow-100 transition-colors duration-300">Sistem Yönetimi</p>
                <ul className="space-y-3 mb-8 text-gray-100 flex-grow">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span>Tam sistem kontrolü / Full system control</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span>Kullanıcıları yönet / Manage users</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span>Analitikleri görüntüle / View analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span>Raporlar oluştur / System reports</span>
                  </li>
                </ul>
                <Link to="/login" className="w-full">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                    İdari Girişi / Admin Login
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Başlamaya Hazır mısınız?</h2>
          <p className="text-xl mb-10 text-gray-100">
            Bugün randevu almaya ve yönetmeye başlayın. Ücretsiz ve sadece birkaç saniye içinde başlayabilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/parent">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 px-8 text-base font-semibold shadow-lg">
                <Calendar className="mr-2 h-5 w-5" />
                Randevu Al
              </Button>
            </a>
            <Link to="/login">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 px-8 text-base font-semibold shadow-lg">
                Personel Girişi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black bg-opacity-40 backdrop-blur-sm text-gray-300 py-12 border-t border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/bahcesehir-logo.jpg" alt="Bahçeşehir Koleji" className="h-10 w-auto" />
                <span className="font-bold text-white">Bahçeşehir Koleji</span>
              </div>
              <p className="text-sm">Randevu Sistemi - 1983'den Beri Eğitim Alanında Öncü</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Özellikler</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/parent" className="hover:text-white transition">Randevu Al</a></li>
                <li><Link to="/login" className="hover:text-white transition">Saati Yönet</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Kullanıcılar</h4>
              <ul className="space-y-2 text-sm">
                <li>Veliler</li>
                <li>Öğretmenler</li>
                <li>Yöneticiler</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">İletişim</h4>
              <ul className="space-y-2 text-sm">
                <li>destek@bahcesehirkolleji.com</li>
                <li>+90 444 51 22</li>
                <li>bahcesehir.k12.tr</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Bahçeşehir Koleji. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


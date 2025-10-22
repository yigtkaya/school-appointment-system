import { useNavigate } from '@tanstack/react-router';
import { Calendar, Users, Clock, CheckCircle, ArrowRight, BookOpen, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export default function IndexPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Browse available time slots and book appointments with teachers in minutes',
    },
    {
      icon: Users,
      title: 'Teacher Profiles',
      description: 'View teacher details, subjects, and availability before booking',
    },
    {
      icon: Clock,
      title: 'Flexible Slots',
      description: 'Teachers set their own availability across multiple classes',
    },
    {
      icon: CheckCircle,
      title: 'Instant Confirmation',
      description: 'Receive immediate confirmation or wait for teacher approval',
    },
  ];

  const steps = [
    {
      number: 1,
      title: 'Select Class',
      description: 'Choose the class you want to meet about',
    },
    {
      number: 2,
      title: 'Pick Student',
      description: 'Select the student for the appointment',
    },
    {
      number: 3,
      title: 'Choose Teacher',
      description: 'Select the teacher teaching that class',
    },
    {
      number: 4,
      title: 'Pick Time',
      description: 'Choose an available date and time slot',
    },
    {
      number: 5,
      title: 'Confirm',
      description: 'Add your details and confirm the booking',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EduMeet</span>
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate({ to: '/dashboard' })}
                  className="px-6 py-2 text-gray-700 font-medium hover:text-blue-600 transition"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate({ to: '/login' })}
                  className="px-6 py-2 text-gray-700 font-medium hover:text-blue-600 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate({ to: '/register' })}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Schedule Teacher Meetings <span className="text-blue-600">Instantly</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Book parent-teacher appointments in seconds. No more endless emails or phone calls. 
              Simple, fast, and convenient for everyone.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => navigate({ to: '/booking' })}
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                Book Now <ArrowRight className="w-5 h-5" />
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate({ to: '/register' })}
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition"
                >
                  Sign Up as Teacher
                </button>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition duration-300">
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="mt-6 pt-6 border-t space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 bg-blue-200 rounded w-20"></div>
                    <div className="h-3 bg-green-200 rounded w-20"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-purple-200 rounded w-20"></div>
                    <div className="h-3 bg-blue-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EduMeet?</h2>
            <p className="text-xl text-gray-600">Everything you need to schedule meetings efficiently</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition duration-300 group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
                    <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Book an appointment in just 5 easy steps</p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 md:gap-0">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                {/* Step Circle */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg">
                  {step.number}
                </div>

                {/* Connector Line */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 top-8" style={{ width: '100%' }}></div>
                )}

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile view of steps */}
          <div className="md:hidden mt-8 space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {step.number}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join parents and teachers who are already saving time with EduMeet
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => navigate({ to: '/booking' })}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition shadow-lg"
            >
              Book an Appointment
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => navigate({ to: '/register' })}
                className="px-8 py-4 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition border-2 border-white"
              >
                Become a Teacher
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">100+</div>
              <p className="text-xl text-gray-600">Active Teachers</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-600 mb-2">5000+</div>
              <p className="text-xl text-gray-600">Appointments Scheduled</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-600 mb-2">98%</div>
              <p className="text-xl text-gray-600">User Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Powerful Features</h2>

          <div className="space-y-16">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Smart Scheduling</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Teachers set their own availability slots across different days and times. 
                  Parents can instantly see all available slots and book without any hassle.
                </p>
                <ul className="space-y-3">
                  {['Multiple time slots per day', 'Weekly recurring availability', 'Real-time slot updates'].map(
                    (item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-700">
                        <Zap className="w-5 h-5 text-blue-600" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl h-64 flex items-center justify-center">
                <Calendar className="w-32 h-32 text-blue-600 opacity-50" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl h-64 flex items-center justify-center md:order-last">
                <Users className="w-32 h-32 text-green-600 opacity-50" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Parent & Student Management</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Browse all available classes, students, and teachers. Add parent contact information 
                  and optional notes about meeting topics.
                </p>
                <ul className="space-y-3">
                  {['Multiple class browsing', 'Student selection', 'Contact information capture'].map(
                    (item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Teacher Dashboard</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Teachers have full control over their availability, appointments, and settings. 
                  Approve or reject bookings with just one click.
                </p>
                <ul className="space-y-3">
                  {['Appointment management', 'Approval workflows', 'Availability control'].map(
                    (item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-5 h-5 text-purple-600" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl h-64 flex items-center justify-center">
                <Clock className="w-32 h-32 text-purple-600 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6" />
                <span className="font-bold">EduMeet</span>
              </div>
              <p className="text-gray-400">
                Making parent-teacher meetings simple and convenient for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => navigate({ to: '/booking' })} className="hover:text-white transition">
                    Book Now
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate({ to: '/login' })} className="hover:text-white transition">
                    Login
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate({ to: '/register' })} className="hover:text-white transition">
                    Register
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Teachers</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => navigate({ to: '/register' })} className="hover:text-white transition">
                    Sign Up
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate({ to: '/login' })} className="hover:text-white transition">
                    Login to Dashboard
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>help@edumeet.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EduMeet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
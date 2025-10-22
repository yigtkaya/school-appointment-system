import { useState } from 'react';
import { LayoutDashboard, Users, BookOpen, Calendar, LogOut } from 'lucide-react';
import { DashboardOverview } from './DashboardOverview';
import { TeachersManagement } from './TeachersManagement';
import { ClassesManagement } from './ClassesManagement';
import { StudentsManagement } from './StudentsManagement';
import { AppointmentsManagement } from './AppointmentsManagement';
import { useAuthStore } from '@/store/auth';
import { useNavigate } from '@tanstack/react-router';

type TabType = 'overview' | 'teachers' | 'classes' | 'students' | 'appointments';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  const tabs: Array<{ id: TabType; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome, {user?.name} • {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && <DashboardOverview />}
        {activeTab === 'teachers' && <TeachersManagement />}
        {activeTab === 'classes' && <ClassesManagement />}
        {activeTab === 'students' && <StudentsManagement />}
        {activeTab === 'appointments' && <AppointmentsManagement />}
      </main>
    </div>
  );
}

export default AdminDashboard;

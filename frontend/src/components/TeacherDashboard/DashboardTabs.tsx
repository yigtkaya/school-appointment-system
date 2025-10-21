import { Calendar, Clock, User } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: 'appointments' | 'slots' | 'profile';
  onTabChange: (tab: 'appointments' | 'slots' | 'profile') => void;
  pendingCount: number;
}

/**
 * Tab navigation for teacher dashboard
 */
export function DashboardTabs({ activeTab, onTabChange, pendingCount }: DashboardTabsProps) {
  const tabs = [
    {
      id: 'appointments' as const,
      label: 'Appointments',
      icon: Calendar,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      id: 'slots' as const,
      label: 'Availability',
      icon: Clock,
    },
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white rounded-lg shadow-sm">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 bg-red-600 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardTabs;

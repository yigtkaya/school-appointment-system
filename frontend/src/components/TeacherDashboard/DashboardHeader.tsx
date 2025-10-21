import { Calendar, CheckCircle } from 'lucide-react';
import type { User } from '../../types/schemas';

interface DashboardHeaderProps {
  teacher: User;
  stats: {
    pending: number;
    confirmed: number;
    total: number;
  };
}

/**
 * Header component showing teacher info and appointment statistics
 */
export function DashboardHeader({ teacher, stats }: DashboardHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hoşgeldiniz, {teacher.name}!</h1>
          <p className="text-blue-100">{teacher.branch || 'Öğretmen'}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total appointments */}
          <div className="bg-blue-500 bg-opacity-50 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Toplam Randevular</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          {/* Confirmed appointments */}
          <div className="bg-green-500 bg-opacity-50 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Onaylanmış Toplantılar</p>
                <p className="text-3xl font-bold mt-2">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;

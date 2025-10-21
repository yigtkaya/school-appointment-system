import { Mail, User as UserIcon, BookOpen } from 'lucide-react';
import type { User } from '../../types';

interface ProfileSettingsProps {
  teacher: User;
  onProfileUpdate: () => void;
}

/**
 * Display teacher profile information
 * Note: This is read-only for now. Full edit functionality can be added later.
 */
export function ProfileSettings({ teacher }: ProfileSettingsProps) {
  return (
    <div className="max-w-2xl">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profil Bilgileri</h2>

        {/* Profile details */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{teacher.name}</span>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{teacher.email}</span>
            </div>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branş</label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{teacher.branch || 'Belirtilmemiş'}</span>
            </div>
          </div>

          {/* Appointment Approval Setting */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Randevu Ayarları</h3>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Randevu Onayı Gerekiyor</p>
                  <p className="text-sm text-blue-800 mt-1">
                    {teacher.require_approval
                      ? 'Yeni randevular beklemede oluşturulacak ve onayınız gerekecek.'
                      : 'Yeni randevular otomatik olarak onaylanacak ve onayınıza ihtiyaç duymayacak.'}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    teacher.require_approval
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {teacher.require_approval ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>

          {/* Info message */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              ℹ️ <strong>Note:</strong> Profile information and settings can only be modified by administrators. Contact your admin to make changes.
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 font-medium">Account Status</p>
          <p className="text-lg font-semibold text-green-600 mt-2">Active</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 font-medium">Member Since</p>
          <p className="text-lg font-semibold text-gray-900 mt-2">
            {new Date(teacher.created_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 font-medium">Role Type</p>
          <p className="text-lg font-semibold text-blue-600 mt-2 capitalize">
            {teacher.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;

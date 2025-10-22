import { useState } from 'react';
import {
  useTeachers,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useApproveTeacherMutation,
  useRequireApprovalMutation,
} from '@/hooks';
import type { User, CreateUser, UpdateUser } from '@/api/types';
import { Edit2, Trash2, Check, X, Plus, AlertCircle } from 'lucide-react';

export function TeachersManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateUser>({
    name: '',
    email: '',
    password: '',
    branch: '',
  });

  const { data: teachers, isLoading, isError } = useTeachers();
  const createMutation = useCreateTeacherMutation();
  const updateMutation = useUpdateTeacherMutation();
  const deleteMutation = useDeleteTeacherMutation();
  const approveMutation = useApproveTeacherMutation();
  const requireApprovalMutation = useRequireApprovalMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { password, ...updateData } = formData;
        const updatePayload: UpdateUser = {
          name: updateData.name,
          branch: updateData.branch,
        };
        if (password) {
          (updatePayload as any).password = password;
        }
        await updateMutation.mutateAsync({ id: editingId, data: updatePayload });
        setEditingId(null);
      } else {
        await createMutation.mutateAsync(formData);
      }
      setFormData({ name: '', email: '', password: '', branch: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save teacher:', error);
    }
  };

  const handleEdit = (teacher: User) => {
    setEditingId(teacher.id);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: '',
      branch: teacher.branch || '',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', branch: '' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
          </div>
          <p className="text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <p className="text-red-800">Failed to load teachers</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Teachers Management</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Teacher
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Teacher' : 'Add New Teacher'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Teacher name"
                />
              </div>

              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="teacher@example.com"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={formData.branch || ''}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Math, English"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingId ? 'New Password (optional)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={editingId ? 'Leave blank to keep current' : 'Password'}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Teacher'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teachers Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {teachers && teachers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Branch</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">{teacher.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{teacher.email}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{teacher.branch || '—'}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          teacher.require_approval
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {teacher.require_approval ? 'Requires Approval' : 'Auto-Approve'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit teacher"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {teacher.require_approval ? (
                          <button
                            onClick={() => approveMutation.mutate(teacher.id)}
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
                            title="Approve teacher"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => requireApprovalMutation.mutate(teacher.id)}
                            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 transition-colors"
                            title="Require approval"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this teacher?')) {
                              deleteMutation.mutate(teacher.id);
                            }
                          }}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete teacher"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No teachers found. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

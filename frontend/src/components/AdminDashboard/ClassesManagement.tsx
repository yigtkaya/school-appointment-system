import { useState } from 'react';
import {
  useAdminClasses,
  useAdminCreateClassMutation,
  useAdminUpdateClassMutation,
  useAdminDeleteClassMutation,
} from '@/hooks';
import type { Class, CreateClass } from '@/api/types';
import { Edit2, Trash2, Plus, AlertCircle } from 'lucide-react';

export function ClassesManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateClass>({
    grade: 1,
    section: '',
  });

  const { data: classes, isLoading, isError } = useAdminClasses();
  const createMutation = useAdminCreateClassMutation();
  const updateMutation = useAdminUpdateClassMutation();
  const deleteMutation = useAdminDeleteClassMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: formData });
        setEditingId(null);
      } else {
        await createMutation.mutateAsync(formData);
      }
      setFormData({ grade: 1, section: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save class:', error);
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingId(classItem.id);
    setFormData({
      grade: classItem.grade,
      section: classItem.section,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ grade: 1, section: '' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
          </div>
          <p className="text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <p className="text-red-800">Failed to load classes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Classes Management</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Class
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Class' : 'Add New Class'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="12"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Grade number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section *
                </label>
                <input
                  type="text"
                  required
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., A, B, C"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Class'}
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

      {/* Classes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes && classes.length > 0 ? (
          classes.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Grade {classItem.grade}</h3>
                  <p className="text-sm text-gray-600 mt-1">Section: {classItem.section}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  ID: {classItem.id}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(classItem)}
                  className="flex-1 inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this class? All associated data will be removed.')) {
                      deleteMutation.mutate(classItem.id);
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-2 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-gray-500">
            <p>No classes found. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

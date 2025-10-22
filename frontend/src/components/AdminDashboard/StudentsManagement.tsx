import { useState } from 'react';
import {
  useAdminClasses,
  useAdminStudents,
  useAdminCreateStudentMutation,
  useAdminUpdateStudentMutation,
  useAdminDeleteStudentMutation,
} from '@/hooks';
import type { Student, CreateStudent, UpdateStudent } from '@/api/types';
import { Edit2, Trash2, Plus } from 'lucide-react';

export function StudentsManagement() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateStudent>({
    name: '',
    class_id: 0,
  });

  const { data: classes, isLoading: classesLoading } = useAdminClasses();
  const { data: students, isLoading: studentsLoading } = useAdminStudents(
    selectedClassId || 0
  );

  const createMutation = useAdminCreateStudentMutation();
  const updateMutation = useAdminUpdateStudentMutation();
  const deleteMutation = useAdminDeleteStudentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updateData: UpdateStudent = {
          name: formData.name,
          class_id: formData.class_id,
        };
        await updateMutation.mutateAsync({ id: editingId, data: updateData });
        setEditingId(null);
      } else {
        await createMutation.mutateAsync(formData);
      }
      setFormData({ name: '', class_id: selectedClassId || 0 });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save student:', error);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setFormData({
      name: student.name,
      class_id: student.class_id,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', class_id: selectedClassId || 0 });
  };

  if (classesLoading) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900">Students Management</h2>

      {/* Class Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select a Class to Manage Students
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {classes && classes.length > 0 ? (
            classes.map((classItem) => (
              <button
                key={classItem.id}
                onClick={() => {
                  setSelectedClassId(classItem.id);
                  setShowForm(false);
                  setEditingId(null);
                }}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedClassId === classItem.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <p className="font-semibold text-gray-900">Grade {classItem.grade}</p>
                <p className="text-sm text-gray-600">Section {classItem.section}</p>
              </button>
            ))
          ) : (
            <p className="col-span-full text-gray-500 text-sm">No classes available. Create classes first.</p>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {selectedClassId && showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Student' : 'Add New Student'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Student name"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Student'}
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

      {/* Students Table */}
      {selectedClassId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Students ({students?.length || 0})
            </h3>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Student
              </button>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {studentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
                  </div>
                  <p className="text-gray-600">Loading students...</p>
                </div>
              </div>
            ) : students && students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 text-sm text-gray-900 font-medium">{student.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{student.id}</td>
                        <td className="px-6 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit student"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this student?')) {
                                  deleteMutation.mutate(student.id);
                                }
                              }}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                              title="Delete student"
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
                <p>No students in this class. Add one to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

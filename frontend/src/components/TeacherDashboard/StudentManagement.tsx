import { useState, useMemo } from 'react';
import { Plus, Trash2, AlertCircle, Search, Check } from 'lucide-react';
import { 
  useTeacherClasses, 
  useStudentsByClass, 
  useAvailableStudents,
  useAddStudentToClassMutation,
  useCreateStudentTeacherMutation,
  useRemoveStudentFromClassMutation,
} from '../../hooks';
import type { Student } from '../../api/types';

interface StudentManagementProps {
  teacherId: number;
}

interface CreateStudentFormData {
  name: string;
}

/**
 * Teacher Student Management
 * Allows teachers to:
 * - Select a class
 * - View students in the class
 * - Add existing students via combobox with search
 * - Create new students and add them to the class
 * - Remove students from the class
 */
export function StudentManagement({ teacherId: _teacherId }: StudentManagementProps) {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCombobox, setShowCombobox] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateStudentFormData>({
    name: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch teacher's classes
  const classesQuery = useTeacherClasses();

  // Fetch students in selected class
  const studentsQuery = useStudentsByClass(selectedClassId || 0);

  // Fetch all available students for combobox
  const availableStudentsQuery = useAvailableStudents();

  // Mutations
  const addStudentMutation = useAddStudentToClassMutation();
  const createStudentMutation = useCreateStudentTeacherMutation();
  const removeStudentMutation = useRemoveStudentFromClassMutation();

  // Filter available students by search query and exclude already added students
  const currentClassStudents = studentsQuery.data || [];
  const currentClassStudentIds = new Set(currentClassStudents.map((s) => s.id));

  const filteredAvailableStudents = useMemo(() => {
    if (!availableStudentsQuery.data) return [];

    return availableStudentsQuery.data
      .filter((student: Student) => !currentClassStudentIds.has(student.id))
      .filter((student: Student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [availableStudentsQuery.data, currentClassStudentIds, searchQuery]);

  const handleSelectClass = (classId: number) => {
    setSelectedClassId(classId);
    setSearchQuery('');
    setShowCombobox(false);
  };

  const handleAddStudentFromList = async (student: Student) => {
    if (!selectedClassId) return;

    try {
      await addStudentMutation.mutateAsync({
        classId: selectedClassId,
        studentId: student.id,
      });
      setSuccessMessage(`Added ${student.name} to the class`);
      setSearchQuery('');
      setShowCombobox(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to add student:', error);
    }
  };

  const handleCreateAndAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !createFormData.name.trim()) return;

    try {
      await createStudentMutation.mutateAsync({
        name: createFormData.name.trim(),
        class_id: selectedClassId,
      });
      setSuccessMessage(`Created and added ${createFormData.name} to the class`);
      setCreateFormData({ name: '' });
      setShowCreateForm(false);
      setSearchQuery('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to create student:', error);
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!selectedClassId) return;

    const student = currentClassStudents.find((s) => s.id === studentId);
    if (!confirm(`Are you sure you want to remove ${student?.name} from this class?`)) {
      return;
    }

    try {
      await removeStudentMutation.mutateAsync({
        classId: selectedClassId,
        studentId: studentId,
      });
      setSuccessMessage(`Removed student from the class`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to remove student:', error);
    }
  };

  const selectedClass = classesQuery.data?.find((c: any) => c.id === selectedClassId);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Manage Class Students</h2>
        <p className="text-gray-600">
          Add or remove students from your classes
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Class Selection */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Class
        </label>
        {classesQuery.isLoading ? (
          <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
        ) : classesQuery.data?.length === 0 ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            <p>You are not assigned to any classes yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {classesQuery.data?.map((cls: any) => (
              <button
                key={cls.id}
                onClick={() => handleSelectClass(cls.id)}
                className={`p-3 rounded-lg font-medium transition-all ${
                  selectedClassId === cls.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Grade {cls.grade} - {cls.section}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedClass && (
        <>
          {/* Current Students List */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Students in Grade {selectedClass.grade}-{selectedClass.section}
              </h3>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {currentClassStudents.length} students
              </span>
            </div>

            {studentsQuery.isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-10 rounded"></div>
                ))}
              </div>
            ) : currentClassStudents.length === 0 ? (
              <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 mb-4">No students in this class yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentClassStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <span className="font-medium text-gray-800">{student.name}</span>
                    <button
                      onClick={() => handleRemoveStudent(student.id)}
                      disabled={removeStudentMutation.isPending}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Student Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Students</h3>

            <div className="space-y-3">
              {/* Option 1: Add from existing students */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Existing Student
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowCombobox(true);
                      }}
                      onFocus={() => setShowCombobox(true)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Combobox Dropdown */}
                  {showCombobox && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                      {filteredAvailableStudents.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          {searchQuery
                            ? 'No students found matching your search'
                            : 'All available students are already in this class'}
                        </div>
                      ) : (
                        <ul>
                          {filteredAvailableStudents.map((student: Student) => (
                            <li key={student.id}>
                              <button
                                onClick={() => handleAddStudentFromList(student)}
                                disabled={addStudentMutation.isPending}
                                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-between group"
                              >
                                <span>{student.name}</span>
                                <Plus className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Option 2: Create new student */}
              <div className="pt-2">
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create New Student
                </button>

                {showCreateForm && (
                  <form onSubmit={handleCreateAndAddStudent} className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student Name
                      </label>
                      <input
                        type="text"
                        value={createFormData.name}
                        onChange={(e) =>
                          setCreateFormData({ name: e.target.value })
                        }
                        placeholder="Enter student name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={
                          !createFormData.name.trim() ||
                          createStudentMutation.isPending
                        }
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
                      >
                        {createStudentMutation.isPending
                          ? 'Creating...'
                          : 'Create & Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setCreateFormData({ name: '' });
                        }}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Help text */}
      {!selectedClass && classesQuery.data && classesQuery.data.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm">
            Select a class above to manage its students
          </p>
        </div>
      )}
    </div>
  );
}

export default StudentManagement;

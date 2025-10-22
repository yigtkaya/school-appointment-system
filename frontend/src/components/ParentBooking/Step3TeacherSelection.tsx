import { useState } from 'react';
import { useClassTeachers } from '@/hooks/useClasses';
import type { User } from '@/api/types';

interface Step3Props {
  classId: number | null;
  selectedTeacher: User | null;
  onSelectTeacher: (teacher: User) => void;
}

export function Step3TeacherSelection({
  classId,
  selectedTeacher,
  onSelectTeacher,
}: Step3Props) {
  const { data: teachers, isLoading, isError, error } = useClassTeachers(
    classId || 0
  );
  const [searchTerm, setSearchTerm] = useState('');

  if (!classId) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow border border-gray-200">
        <p className="text-gray-600">Please select a class first</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-white rounded-lg shadow border border-red-200">
        <p className="text-red-600">Error loading teachers: {error?.message}</p>
      </div>
    );
  }

  const filteredTeachers = teachers?.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Teacher</h2>
        <p className="text-gray-600">Choose the teacher you want to meet</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search teachers by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredTeachers.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          {teachers?.length === 0
            ? 'No teachers assigned to this class'
            : 'No teachers match your search'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTeachers.map((teacher) => (
            <button
              key={teacher.id}
              onClick={() => onSelectTeacher(teacher)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedTeacher?.id === teacher.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="font-semibold text-gray-800">{teacher.name}</div>
              <div className="text-sm text-gray-600 mt-1">{teacher.email}</div>
              {teacher.branch && (
                <div className="text-sm text-gray-500 mt-1">
                  Branch: {teacher.branch}
                </div>
              )}
              {teacher.require_approval === 1 && (
                <div className="text-xs text-orange-600 mt-2 font-medium">
                  ⚠ Requires approval
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedTeacher && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800">✓ Selected: {selectedTeacher.name}</p>
          {selectedTeacher.require_approval === 1 && (
            <p className="text-sm text-orange-700 mt-2">
              This teacher requires approval for appointments
            </p>
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useStudentsByClass } from '@/hooks/useStudents';
import type { Student } from '@/api/types';

interface Step2Props {
  classId: number | null;
  selectedStudent: Student | null;
  onSelectStudent: (student: Student) => void;
}

export function Step2StudentSelection({
  classId,
  selectedStudent,
  onSelectStudent,
}: Step2Props) {
  const { data: students, isLoading, isError, error } = useStudentsByClass(
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
        <p className="text-red-600">Error loading students: {error?.message}</p>
      </div>
    );
  }

  const filteredStudents = students?.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Student</h2>
        <p className="text-gray-600">Choose your child's name</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search students by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          {students?.length === 0
            ? 'No students in this class'
            : 'No students match your search'}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredStudents.map((student) => (
            <button
              key={student.id}
              onClick={() => onSelectStudent(student)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedStudent?.id === student.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="font-semibold text-gray-800">{student.name}</div>
              <div className="text-sm text-gray-500 mt-1">ID: {student.id}</div>
            </button>
          ))}
        </div>
      )}

      {selectedStudent && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800">✓ Selected: {selectedStudent.name}</p>
        </div>
      )}
    </div>
  );
}

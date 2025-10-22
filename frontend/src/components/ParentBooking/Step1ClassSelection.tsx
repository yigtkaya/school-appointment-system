import { useState } from 'react';
import { useClasses } from '@/hooks/useClasses';
import type { Class } from '@/api/types';

interface Step1Props {
  selectedClass: Class | null;
  onSelectClass: (classItem: Class) => void;
}

export function Step1ClassSelection({ selectedClass, onSelectClass }: Step1Props) {
  const { data: classes, isLoading, isError, error } = useClasses();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
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
        <p className="text-red-600">Error loading classes: {error?.message}</p>
      </div>
    );
  }

  const filteredClasses = classes?.filter((c) =>
    `${c.grade}${c.section}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sinif Secimi</h2>
        <p className="text-gray-600">Cocugunuzun bulundugu sinifi secin</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by grade and section (e.g., '1A', '5B')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredClasses.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          Bir eslesme bulunamadi
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((classItem) => (
            <button
              key={classItem.id}
              onClick={() => onSelectClass(classItem)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                selectedClass?.id === classItem.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="text-2xl font-bold text-gray-800">
                Sinif {classItem.grade}
              </div>
              <div className="text-lg font-semibold text-gray-600">
                Section {classItem.section}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Class {classItem.grade}{classItem.section}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedClass && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800">
            ✓ Selected: Grade {selectedClass.grade}, Section {selectedClass.section}
          </p>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import {
  Step1ClassSelection,
  Step2StudentSelection,
  Step3TeacherSelection,
  Step4TimeSelection,
  Step5Confirmation,
} from '@/components/ParentBooking';
import type { Class, Student, User, AvailableTime } from '@/api/types';

const STEPS = [
  { id: 1, title: 'Class', description: 'Select a class' },
  { id: 2, title: 'Student', description: 'Choose student' },
  { id: 3, title: 'Teacher', description: 'Pick teacher' },
  { id: 4, title: 'Time', description: 'Choose date & time' },
  { id: 5, title: 'Confirm', description: 'Verify details' },
];

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<AvailableTime | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleClassSelection = (classItem: Class) => {
    setSelectedClass(classItem);
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleStudentSelection = (student: Student) => {
    setSelectedStudent(student);
    if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleTeacherSelection = (teacher: User) => {
    setSelectedTeacher(teacher);
    if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleDateTimeSelection = (date: string, time: AvailableTime) => {
    setSelectedDate(date);
    setSelectedTime(time);
    if (currentStep === 4) {
      setCurrentStep(5);
    }
  };

  const handleBookingSuccess = (appointmentId: number) => {
    setSuccessMessage(
      `Appointment successfully created! Confirmation ID: ${appointmentId}`
    );
    // Reset form
    setTimeout(() => {
      setCurrentStep(1);
      setSelectedClass(null);
      setSelectedStudent(null);
      setSelectedTeacher(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setSuccessMessage('');
    }, 3000);
  };

  const handleBookingError = (error: string) => {
    setErrorMessage(error);
  };

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!selectedClass;
      case 2:
        return !!selectedStudent;
      case 3:
        return !!selectedTeacher;
      case 4:
        return !!selectedDate && !!selectedTime;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Book a Meeting with Teacher
          </h1>
          <p className="text-lg text-gray-600">
            Follow the steps below to schedule an appointment
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ {successMessage}</p>
            <p className="text-green-700 text-sm mt-1">
              You will be redirected shortly...
            </p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-start">
            <p className="text-red-800">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step, idx) => (
              <div
                key={step.id}
                className={`flex-1 ${idx < STEPS.length - 1 ? 'mr-2' : ''}`}
              >
                <button
                  onClick={() => {
                    if (step.id < currentStep || canProceed(step.id)) {
                      setCurrentStep(step.id);
                    }
                  }}
                  disabled={step.id > currentStep && !canProceed(step.id)}
                  className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : step.id < currentStep
                        ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {step.id}. {step.title}
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-1 text-xs text-gray-600">
            {STEPS.map((step) => (
              <div key={step.id} className="text-center flex-1">
                {step.description}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {currentStep === 1 && (
            <Step1ClassSelection
              selectedClass={selectedClass}
              onSelectClass={handleClassSelection}
            />
          )}

          {currentStep === 2 && (
            <Step2StudentSelection
              classId={selectedClass?.id || null}
              selectedStudent={selectedStudent}
              onSelectStudent={handleStudentSelection}
            />
          )}

          {currentStep === 3 && (
            <Step3TeacherSelection
              classId={selectedClass?.id || null}
              selectedTeacher={selectedTeacher}
              onSelectTeacher={handleTeacherSelection}
            />
          )}

          {currentStep === 4 && (
            <Step4TimeSelection
              teacherId={selectedTeacher?.id || null}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDateTime={handleDateTimeSelection}
            />
          )}

          {currentStep === 5 &&
            selectedClass &&
            selectedStudent &&
            selectedTeacher &&
            selectedDate &&
            selectedTime && (
              <Step5Confirmation
                classData={selectedClass}
                studentData={selectedStudent}
                teacherData={selectedTeacher}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSuccess={handleBookingSuccess}
                onError={handleBookingError}
              />
            )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          {currentStep < 5 && (
            <button
              onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
              disabled={!canProceed(currentStep)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

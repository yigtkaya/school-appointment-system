// Auth hooks
export { 
  useMe, 
  useCheckAuth, 
  useLogin, 
  useRegister, 
  useLogout, 
  useRefreshToken 
} from './useAuth';

// Classes hooks
export {
  useClasses,
  useClass,
  useClassTeachers,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useAssignTeacherMutation,
  useTeacherClasses,
} from './useClasses';

// Students hooks
export {
  useStudent,
  useStudentsByClass,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useAvailableStudents,
  useAddStudentToClassMutation,
  useCreateStudentTeacherMutation,
  useRemoveStudentFromClassMutation,
} from './useStudents';

// Slots hooks
export {
  useTeacherSlots,
  useTeacherAvailableDays,
  useTeacherAvailableTimes,
  useCreateSlotMutation,
  useUpdateSlotMutation,
  useDeleteSlotMutation,
} from './useSlots';

// Appointments hooks
export {
  useAppointments,
  useTeacherAppointments,
  useAppointment,
  useAppointmentStats,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useCancelAppointmentMutation,
} from './useAppointments';

// Admin Users hooks
export {
  useTeachers,
  useTeacher,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useApproveTeacherMutation,
  useRequireApprovalMutation,
} from './useAdminUsers';

// Admin Classes hooks
export {
  useAdminClasses,
  useAdminClass,
  useAdminCreateClassMutation,
  useAdminUpdateClassMutation,
  useAdminDeleteClassMutation,
} from './useAdminClasses';

// Admin Students hooks
export {
  useAdminStudents,
  useAdminCreateStudentMutation,
  useAdminUpdateStudentMutation,
  useAdminDeleteStudentMutation,
} from './useAdminStudents';

// Admin Appointments hooks
export {
  useAdminAllAppointments,
  useAdminStats,
  useAdminAppointment,
} from './useAdminAppointments';

// Query keys
export { queryKeys } from './queryKeys';

// Auth utilities (if they exist)
// export {
//   ProtectedRoute,
//   useHasRole,
//   useIsAuthenticated,
//   useCurrentUser,
//   useAuthToken,
// } from './useAuth.utils';

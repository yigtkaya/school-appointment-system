// Auth hooks
export { useProfile, useRegisterMutation, useLoginMutation } from './useAuth';

// Classes hooks
export {
    useClasses,
    useClass,
    useCreateClassMutation,
    useUpdateClassMutation,
    useDeleteClassMutation,
} from './useClasses';

// Students hooks
export {
    useStudents,
    useStudent,
    useCreateStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
} from './useStudents';

// Slots hooks
export {
    useTeacherSlots,
    useCreateSlotMutation,
    useUpdateSlotMutation,
    useDeleteSlotMutation,
    useTeacherAvailableDays,
    useTeacherAvailableTimes,
} from './useSlots';

// Appointments hooks
export {
    useAppointments,
    useTeacherAppointments,
    useAppointment,
    useCreateAppointmentMutation,
    useUpdateAppointmentMutation,
    useDeleteAppointmentMutation,
} from './useAppointments';

// Admin Users hooks
export {
    useUsers,
    useUser,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} from './useAdminUsers';

// Query keys
export { queryKeys } from './queryKeys';

// Auth utilities (components and helper hooks)
export {
    ProtectedRoute,
    useHasRole,
    useIsAuthenticated,
    useCurrentUser,
    useAuthToken,
} from './useAuth.utils';

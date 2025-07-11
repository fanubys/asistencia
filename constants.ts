import { AttendanceStatus } from './types.ts';

export const ATTENDANCE_STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string; darkColor: string }[] = [
  { value: AttendanceStatus.Presente, label: 'Presente', color: 'text-green-600', darkColor: 'dark:text-green-400' },
  { value: AttendanceStatus.Ausente, label: 'Ausente', color: 'text-red-600', darkColor: 'dark:text-red-400' },
  { value: AttendanceStatus.Tardanza, label: 'Tardanza', color: 'text-yellow-600', darkColor: 'dark:text-yellow-400' },
  { value: AttendanceStatus.Justificado, label: 'Justificado', color: 'text-blue-600', darkColor: 'dark:text-blue-400' },
];
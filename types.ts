

export enum AttendanceStatus {
  Presente = 'Presente',
  Ausente = 'Ausente',
  Tardanza = 'Tardanza',
  Justificado = 'Justificado',
}

export interface Student {
  id: string;
  name: string;
  photoUrl?: string;
  observations?: string;
}

export interface Group {
  id: string;
  name: string;
  grade: string;
  students: Student[];
}

export interface AttendanceRecord {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  observations: string;
}

export type Theme = 'light' | 'dark' | 'accessible';

export interface DataState {
  groups: Group[];
  attendance: AttendanceRecord[];
}
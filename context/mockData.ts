import { DataState, AttendanceStatus } from '../types.ts';

export const MOCK_DATA: DataState = {
  groups: [
    {
      id: 'g1',
      name: 'Clase de Biología',
      grade: '10mo Grado',
      students: [
        { id: 's1', name: 'Ana Torres', photoUrl: 'https://picsum.photos/seed/s1/100', observations: 'Alergia al polen. Sentarse lejos de las ventanas.' },
        { id: 's2', name: 'Luis Pérez', photoUrl: 'https://picsum.photos/seed/s2/100' },
        { id: 's3', name: 'Marta Gómez', photoUrl: 'https://picsum.photos/seed/s3/100' },
        { id: 's4', name: 'Juan Castro', photoUrl: 'https://picsum.photos/seed/s4/100' },
      ],
    },
    {
      id: 'g2',
      name: 'Taller de Arte',
      grade: '11vo Grado',
      students: [
        { id: 's5', name: 'Sofía Reyes', photoUrl: 'https://picsum.photos/seed/s5/100' },
        { id: 's6', name: 'Carlos Mendoza', photoUrl: 'https://picsum.photos/seed/s6/100' },
      ],
    },
  ],
  attendance: [
    { studentId: 's1', date: '2024-05-20', status: AttendanceStatus.Presente, observations: '' },
    { studentId: 's2', date: '2024-05-20', status: AttendanceStatus.Ausente, observations: 'Cita médica' },
    { studentId: 's3', date: '2024-05-20', status: AttendanceStatus.Tardanza, observations: 'Llegó 15 min tarde' },
    { studentId: 's4', date: '2024-05-20', status: AttendanceStatus.Presente, observations: '' },
    { studentId: 's1', date: '2024-05-21', status: AttendanceStatus.Presente, observations: '' },
    { studentId: 's2', date: '2024-05-21', status: AttendanceStatus.Presente, observations: '' },
    { studentId: 's3', date: '2024-05-21', status: AttendanceStatus.Presente, observations: '' },
    { studentId: 's4', date: '2024-05-21', status: AttendanceStatus.Justificado, observations: 'Permiso familiar' },
  ],
};
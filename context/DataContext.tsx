import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Group, Student, AttendanceRecord, DataState } from '../types.ts';
import { MOCK_DATA } from './mockData.ts';

// The shape of the context value
interface DataContextProps {
  state: DataState;
  loading: boolean;
  error: string | null;
  addGroup: (groupData: Omit<Group, 'id' | 'students'>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  addStudent: (groupId: string, studentData: Omit<Student, 'id' | 'photoUrl' | 'observations'> & { observations?: string }) => Promise<void>;
  editStudent: (groupId: string, student: Student) => Promise<void>;
  deleteStudent: (groupId: string, studentId: string) => Promise<void>;
  addStudentsBulk: (groupId: string, students: Student[]) => Promise<void>;
  setAttendance: (records: AttendanceRecord[]) => Promise<void>;
}

export const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DataState>(() => {
    try {
      const localData = localStorage.getItem('asistencia-pro-data');
      if (localData) {
        return JSON.parse(localData);
      }
    } catch (e) {
      console.error("Failed to parse local data", e);
    }
    // If no local data, start with mock data.
    return MOCK_DATA;
  });

  const [loading, setLoading] = useState(false); // Not loading from a remote source anymore
  const [error, setError] = useState<string | null>(null);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('asistencia-pro-data', JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save data to localStorage", e);
      setError("No se pudieron guardar los datos localmente.");
    }
  }, [state]);

  const addGroup = async (groupData: Omit<Group, 'id' | 'students'>) => {
    const newGroup: Group = { ...groupData, id: `g${Date.now()}`, students: [] };
    setState(currentState => ({
      ...currentState,
      groups: [...currentState.groups, newGroup],
    }));
  };
  
  const deleteGroup = async (groupId: string) => {
    setState(currentState => {
      const groupToDelete = currentState.groups.find(g => g.id === groupId);
      if (!groupToDelete) return currentState;

      const studentIdsToDelete = new Set(groupToDelete.students.map(s => s.id));
      const updatedGroups = currentState.groups.filter(g => g.id !== groupId);
      const updatedAttendance = currentState.attendance.filter(a => !studentIdsToDelete.has(a.studentId));
      
      return { ...currentState, groups: updatedGroups, attendance: updatedAttendance };
    });
  };

  const addStudent = async (groupId: string, studentData: Omit<Student, 'id' | 'photoUrl' | 'observations'> & { observations?: string }) => {
    const newStudent: Student = {
      ...studentData,
      id: `s${Date.now()}`,
      photoUrl: `https://picsum.photos/seed/s${Date.now()}/100`,
      observations: studentData.observations || '',
    };
    setState(currentState => ({
      ...currentState,
      groups: currentState.groups.map(g =>
        g.id === groupId ? { ...g, students: [...g.students, newStudent] } : g
      ),
    }));
  };

  const editStudent = async (groupId: string, updatedStudent: Student) => {
    setState(currentState => ({
      ...currentState,
      groups: currentState.groups.map(g =>
        g.id === groupId
        ? { ...g, students: g.students.map(s => s.id === updatedStudent.id ? updatedStudent : s) }
        : g
      ),
    }));
  };

  const deleteStudent = async (groupId: string, studentId: string) => {
    setState(currentState => {
      const updatedGroups = currentState.groups.map(g =>
          g.id === groupId
          ? { ...g, students: g.students.filter(s => s.id !== studentId) }
          : g
      );
      const updatedAttendance = currentState.attendance.filter(a => a.studentId !== studentId);
      return { ...currentState, groups: updatedGroups, attendance: updatedAttendance };
    });
  };

  const addStudentsBulk = async (groupId: string, newStudents: Student[]) => {
    setState(currentState => ({
      ...currentState,
      groups: currentState.groups.map(g =>
        g.id === groupId ? { ...g, students: [...g.students, ...newStudents] } : g
      ),
    }));
  };
  
  const setAttendance = async (records: AttendanceRecord[]) => {
    setState(currentState => {
      const newAttendanceMap = new Map(records.map(r => [`${r.studentId}-${r.date}`, r]));
      const updatedAttendance = [
        ...currentState.attendance.filter(a => !newAttendanceMap.has(`${a.studentId}-${a.date}`)),
        ...records
      ];
      return { ...currentState, attendance: updatedAttendance };
    });
  };

  const value = { state, loading, error, addGroup, deleteGroup, addStudent, editStudent, deleteStudent, addStudentsBulk, setAttendance };
  
  // The app will now render its children immediately. The Firebase-related loading/error screens are no longer needed.
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
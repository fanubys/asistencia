import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config.ts';
import { Group, Student, AttendanceRecord, DataState } from '../types.ts';
import { MOCK_DATA } from './mockData.ts';

// The shape of the context value
interface DataContextProps {
  state: DataState;
  loading: boolean;
  error: string | null;
  // New async functions to replace dispatch
  addGroup: (groupData: Omit<Group, 'id' | 'students'>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  addStudent: (groupId: string, studentData: Omit<Student, 'id' | 'photoUrl' | 'observations'> & { observations?: string }) => Promise<void>;
  editStudent: (groupId: string, student: Student) => Promise<void>;
  deleteStudent: (groupId: string, studentId: string) => Promise<void>;
  addStudentsBulk: (groupId: string, students: Student[]) => Promise<void>;
  setAttendance: (records: AttendanceRecord[]) => Promise<void>;
}

export const DataContext = createContext<DataContextProps | undefined>(undefined);

const initialDataState: DataState = { groups: [], attendance: [] };

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<DataState>(initialDataState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Handle Anonymous Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          setUser(userCredential.user);
        } catch (e) {
          console.error("Anonymous sign-in failed", e);
          setError("No se pudo conectar con el servicio. Por favor, recarga la página.");
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Subscribe to user's data in Firestore
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        setState(docSnap.data().appData as DataState);
      } else {
        console.log("New user, creating data document...");
        await setDoc(docRef, { appData: MOCK_DATA });
        setState(MOCK_DATA);
      }
      setLoading(false);
    }, (e) => {
      console.error("Firestore snapshot error", e);
      setError("Error al cargar los datos. Revisa tu conexión.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getCurrentData = async () => {
    if (!user) throw new Error("User not authenticated");
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data().appData as DataState) : initialDataState;
  };

  const addGroup = async (groupData: Omit<Group, 'id' | 'students'>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const currentData = await getCurrentData();
    const newGroup: Group = {
      ...groupData,
      id: `g${Date.now()}`,
      students: [],
    };
    const updatedGroups = [...currentData.groups, newGroup];
    await updateDoc(docRef, { 'appData.groups': updatedGroups });
  };
  
  const deleteGroup = async (groupId: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const currentData = await getCurrentData();
    const groupToDelete = currentData.groups.find(g => g.id === groupId);
    if (!groupToDelete) return;

    const studentIdsToDelete = new Set(groupToDelete.students.map(s => s.id));
    const updatedGroups = currentData.groups.filter(g => g.id !== groupId);
    const updatedAttendance = currentData.attendance.filter(a => !studentIdsToDelete.has(a.studentId));

    await updateDoc(docRef, { 
      'appData.groups': updatedGroups,
      'appData.attendance': updatedAttendance
    });
  };

  const addStudent = async (groupId: string, studentData: Omit<Student, 'id' | 'photoUrl' | 'observations'> & { observations?: string }) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const currentData = await getCurrentData();
    const newStudent: Student = {
      ...studentData,
      id: `s${Date.now()}`,
      photoUrl: `https://picsum.photos/seed/s${Date.now()}/100`,
      observations: studentData.observations || '',
    };
    const updatedGroups = currentData.groups.map(g =>
      g.id === groupId ? { ...g, students: [...g.students, newStudent] } : g
    );
    await updateDoc(docRef, { 'appData.groups': updatedGroups });
  };

  const editStudent = async (groupId: string, updatedStudent: Student) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const currentData = await getCurrentData();
    const updatedGroups = currentData.groups.map(g =>
        g.id === groupId
        ? { ...g, students: g.students.map(s => s.id === updatedStudent.id ? updatedStudent : s) }
        : g
    );
    await updateDoc(docRef, { 'appData.groups': updatedGroups });
  };

  const deleteStudent = async (groupId: string, studentId: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const currentData = await getCurrentData();
    const updatedGroups = currentData.groups.map(g =>
        g.id === groupId
        ? { ...g, students: g.students.filter(s => s.id !== studentId) }
        : g
    );
    const updatedAttendance = currentData.attendance.filter(a => a.studentId !== studentId);
    await updateDoc(docRef, { 
      'appData.groups': updatedGroups,
      'appData.attendance': updatedAttendance
    });
  };

  const addStudentsBulk = async (groupId: string, newStudents: Student[]) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const currentData = await getCurrentData();
    const updatedGroups = currentData.groups.map(g =>
      g.id === groupId ? { ...g, students: [...g.students, ...newStudents] } : g
    );
    await updateDoc(docRef, { 'appData.groups': updatedGroups });
  };
  
  const setAttendance = async (records: AttendanceRecord[]) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const currentData = await getCurrentData();
    const newAttendanceMap = new Map(records.map(r => [`${r.studentId}-${r.date}`, r]));
    const updatedAttendance = [
      ...currentData.attendance.filter(a => !newAttendanceMap.has(`${a.studentId}-${a.date}`)),
      ...records
    ];
    await updateDoc(docRef, { 'appData.attendance': updatedAttendance });
  };

  const value = {
    state,
    loading,
    error,
    addGroup,
    deleteGroup,
    addStudent,
    editStudent,
    deleteStudent,
    addStudentsBulk,
    setAttendance,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-primary-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Conectando a la nube...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
          <div className="text-center p-4">
            <h2 className="text-xl font-bold text-red-600">Error de Conexión</h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">{error}</p>
          </div>
        </div>
      )
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
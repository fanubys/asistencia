import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collection, doc, onSnapshot, addDoc, deleteDoc, updateDoc, runTransaction, writeBatch, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import { Group, Student, AttendanceRecord, DataState } from '../types.ts';
import { db, firebaseInitializationError } from '../firebase/config.ts';
import { useAuth } from './AuthContext.tsx';
import { generateAvatar } from '../lib/gemini.ts';

type Unsubscribe = () => void;

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
  const { user } = useAuth();
  const [state, setState] = useState<DataState>({ groups: [], attendance: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setState({ groups: [], attendance: [] });
      setLoading(false); 
      return;
    }
    
    if (firebaseInitializationError) {
      setError(firebaseInitializationError.message);
      setLoading(false);
      return;
    }

    if (!db) {
      setError("La configuración de Firebase no es válida o está ausente. La aplicación no puede conectarse a la base de datos.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const uid = user.uid;
    let unsubGroups: Unsubscribe | undefined;
    let unsubAttendance: Unsubscribe | undefined;

    try {
      const groupsQuery = query(collection(db, 'users', uid, 'groups'));
      unsubGroups = onSnapshot(
        groupsQuery,
        (snapshot) => {
          const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
          setState(prevState => ({ ...prevState, groups }));
          setLoading(false);
        }, 
        (err) => {
          console.error("Error fetching groups:", err);
          setError("No se pudieron cargar los grupos.");
          setLoading(false);
        }
      );

      const attendanceQuery = query(collection(db, 'users', uid, 'attendance'));
      unsubAttendance = onSnapshot(
        attendanceQuery,
        (snapshot) => {
          const attendance = snapshot.docs.map(doc => doc.data() as AttendanceRecord);
          setState(prevState => ({ ...prevState, attendance }));
        }, 
        (err) => {
          console.error("Error fetching attendance:", err);
          setError("No se pudieron cargar los registros de asistencia.");
        }
      );
    } catch(err) {
      console.error("Error setting up listeners", err);
      setError("No se pudo conectar con la base de datos.");
      setLoading(false);
    }

    return () => {
      if (unsubGroups) unsubGroups();
      if (unsubAttendance) unsubAttendance();
    };
  }, [user]);

  const withUser = <T extends any[]>(func: (uid: string, ...args: T) => Promise<any>) => {
    return (...args: T): Promise<any> => {
      if (!user) return Promise.reject(new Error("Usuario no autenticado."));
      return func(user.uid, ...args);
    };
  };

  const addGroup = withUser(async (uid: string, groupData: Omit<Group, 'id' | 'students'>) => {
    await addDoc(collection(db, 'users', uid, 'groups'), { ...groupData, students: [] });
  });

  const deleteGroup = withUser(async (uid: string, groupId: string) => {
    const groupRef = doc(db, 'users', uid, 'groups', groupId);
    const groupDoc = await getDocs(query(collection(db, 'users', uid, 'groups'), where('__name__', '==', groupId)));


    if (!groupDoc.empty) {
      const groupData = groupDoc.docs[0].data() as Group;
      const studentIds = groupData.students.map(s => s.id);
      
      if (studentIds.length > 0) {
        const attendanceQuery = query(collection(db, 'users', uid, 'attendance'), where('studentId', 'in', studentIds));
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const batch = writeBatch(db);
        attendanceSnapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
      
      await deleteDoc(groupRef);
    }
  });

  const addStudent = withUser(async (uid: string, groupId: string, studentData: Omit<Student, 'id' | 'photoUrl' | 'observations'> & { observations?: string }) => {
    const photoUrl = await generateAvatar(studentData.name);
    const newStudent: Student = {
      ...studentData,
      id: `s${Date.now()}`,
      photoUrl: photoUrl,
      observations: studentData.observations || '',
    };
    const groupRef = doc(db, 'users', uid, 'groups', groupId);
    await updateDoc(groupRef, { students: arrayUnion(newStudent) });
  });

  const editStudent = withUser(async (uid: string, groupId: string, updatedStudent: Student) => {
    const groupRef = doc(db, 'users', uid, 'groups', groupId);
    await runTransaction(db, async (transaction) => {
      const groupDoc = await transaction.get(groupRef);
      if (!groupDoc.exists()) throw "El grupo no existe!";
      
      const groupData = groupDoc.data() as Omit<Group, 'id'>;
      const updatedStudents = groupData.students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
      transaction.update(groupRef, { students: updatedStudents });
    });
  });

  const deleteStudent = withUser(async (uid: string, groupId: string, studentId: string) => {
    const attendanceQueryRef = query(collection(db, 'users', uid, 'attendance'), where('studentId', '==', studentId));
    const attendanceSnapshot = await getDocs(attendanceQueryRef);
    const batch = writeBatch(db);
    attendanceSnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    const groupRef = doc(db, 'users', uid, 'groups', groupId);
     await runTransaction(db, async (transaction) => {
      const groupDoc = await transaction.get(groupRef);
      if (!groupDoc.exists()) throw "El grupo no existe!";
      
      const groupData = groupDoc.data() as Omit<Group, 'id'>;
      const updatedStudents = groupData.students.filter(s => s.id !== studentId);
      transaction.update(groupRef, { students: updatedStudents });
    });
  });

  const addStudentsBulk = withUser(async (uid: string, groupId: string, newStudents: Student[]) => {
    if (newStudents.length === 0) return;
    const groupRef = doc(db, 'users', uid, 'groups', groupId);
    await updateDoc(groupRef, { students: arrayUnion(...newStudents) });
  });

  const setAttendance = withUser(async (uid: string, records: AttendanceRecord[]) => {
    const batch = writeBatch(db);
    records.forEach(record => {
      const docId = `${record.studentId}_${record.date}`;
      const recordRef = doc(db, 'users', uid, 'attendance', docId);
      batch.set(recordRef, record);
    });
    await batch.commit();
  });

  const value = { state, loading, error, addGroup, deleteGroup, addStudent, editStudent, deleteStudent, addStudentsBulk, setAttendance };

  if (loading && user) {
    return <div className="flex items-center justify-center h-screen w-full text-lg font-semibold text-slate-700 dark:text-slate-300">Cargando datos...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-full p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Error de Configuración</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
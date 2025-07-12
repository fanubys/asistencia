import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header.tsx';
import Button from '../components/ui/Button.tsx';
import Card from '../components/ui/Card.tsx';
import ImageZoom from '../components/ui/ImageZoom.tsx';
import { useData } from '../hooks/useData.ts';
import { AttendanceRecord, AttendanceStatus } from '../types.ts';
import { ATTENDANCE_STATUS_OPTIONS } from '../constants.ts';

const AttendancePage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { state, setAttendance } = useData();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const group = state.groups.find(g => g.id === groupId);

  useEffect(() => {
    if (group) {
      const initialRecords = new Map<string, AttendanceRecord>();
      group.students.forEach(student => {
        const existingRecord = state.attendance.find(a => a.studentId === student.id && a.date === date);
        initialRecords.set(student.id, existingRecord || {
          studentId: student.id,
          date: date,
          status: AttendanceStatus.Presente,
          observations: '',
        });
      });
      setAttendanceRecords(initialRecords);
    }
  }, [groupId, date, state.attendance, group]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const updatedRecords = new Map(attendanceRecords);
    const record = updatedRecords.get(studentId);
    if (record) {
      updatedRecords.set(studentId, { ...record, status });
      setAttendanceRecords(updatedRecords);
    }
  };

  const handleObservationChange = (studentId: string, observations: string) => {
    const updatedRecords = new Map(attendanceRecords);
    const record = updatedRecords.get(studentId);
    if (record) {
      updatedRecords.set(studentId, { ...record, observations });
      setAttendanceRecords(updatedRecords);
    }
  };

  const handlePhotoUpload = (studentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, this would call a function from context
      // to upload the image to Firebase Storage and update the student's photoUrl.
      console.log(`Photo upload initiated for student ${studentId}`);
      alert('La subida de fotos no está implementada en esta versión, pero podría añadirse en el futuro.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const recordsToSave = Array.from(attendanceRecords.values());
      await setAttendance(recordsToSave);
      alert('Asistencia guardada con éxito');
      navigate(`/grupos/${groupId}`);
    } catch (error) {
      console.error("Failed to save attendance:", error);
      alert("Error: No se pudo guardar la asistencia.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!group) return <div>Grupo no encontrado</div>;

  return (
    <div className="p-4 space-y-6">
      <Header title={`Asistencia: ${group.name}`} />
      <Card>
        <label htmlFor="attendance-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Asistencia</label>
        <input
          type="date"
          id="attendance-date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600"
        />
      </Card>
      <div className="space-y-4">
        {group.students.map((student, index) => {
          const record = attendanceRecords.get(student.id);
          return (
            <div key={student.id} className="list-item-animation" style={{ animationDelay: `${index * 50}ms` }}>
              <Card>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex-shrink-0 text-center w-full sm:w-24">
                    <ImageZoom src={student.photoUrl || ''} alt={student.name} className="w-20 h-20 rounded-full object-cover mx-auto" />
                    <label htmlFor={`photo-upload-${student.id}`} className="mt-2 text-xs text-primary-600 dark:text-primary-400 cursor-pointer hover:underline">
                      Cambiar foto
                    </label>
                    <input type="file" id={`photo-upload-${student.id}`} accept="image/*" capture="user" className="hidden" onChange={(e) => handlePhotoUpload(student.id, e)} />
                    <p className="font-bold mt-1 text-slate-800 dark:text-slate-200 truncate">{student.name}</p>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {ATTENDANCE_STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleStatusChange(student.id, opt.value)}
                          className={`px-3 py-1 text-sm font-medium rounded-full border-2 transition-all duration-200 transform active:scale-95 ${record?.status === opt.value ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-transparent border-slate-300 dark:border-slate-600 hover:border-primary-500'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Observaciones..."
                      value={record?.observations || ''}
                      onChange={e => handleObservationChange(student.id, e.target.value)}
                      rows={2}
                      className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600"
                    />
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end pb-4">
        <Button onClick={handleSave} variant="primary" className="w-full sm:w-auto text-lg py-3" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar Asistencia'}
        </Button>
      </div>
    </div>
  );
};

export default AttendancePage;